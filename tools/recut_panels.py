"""
Re-key the VulcaLap panel renders off their white background, properly.

The first pass produced a pale fringe: it flood-filled the white background to a
BINARY alpha and then blurred that alpha. Blurring re-exposed the anti-aliased
ring around the object — and those pixels' RGB is the render's own blend of the
product with the white backdrop, so the soft edge showed white.

This pass:
  1. flood-fills the background from the border (so pale coats keep their faces),
  2. DILATES the background by 1px, removing the white-contaminated ring entirely,
  3. BLEEDS the product's own colour outward into the cleared area, so there is no
     white left underneath the edge at all,
  4. feathers the alpha by a hair for anti-aliasing rather than a hard, jagged cut.

Result: a sharp edge with no halo.
"""
import os
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

SRC = r'C:\IPS\vulcan-systems\public\assets\img\finishes'
KEYS = ['cedar', 'light-oak', 'golden-oak', 'teak', 'dark-oak', 'rosewood',
        'chestnut', 'ebony', 'corten', 'bronze', 'anthracite', 'moss',
        'ivory', 'platinum']

SHIFTS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def shift(a, dy, dx, fill=0):
    out = np.full_like(a, fill)
    h, w = a.shape[:2]
    ys, ye = max(0, dy), min(h, h + dy)
    xs, xe = max(0, dx), min(w, w + dx)
    out[ys:ye, xs:xe] = a[ys - dy:ye - dy, xs - dx:xe - dx]
    return out


def background_mask(rgb, tol=24):
    """Near-white AND reachable from the border, so enclosed pale product areas
    (an ivory face, a bright specular) are never punched through."""
    h, w, _ = rgb.shape
    near = rgb.min(axis=2) >= 255 - tol
    bg = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near[y, x] and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near[y, x] and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in SHIFTS:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                q.append((ny, nx))
    return bg


def key(rgb_img, ring_px=2, bleed=6, feather=0.5):
    """Keep the silhouette, but rebuild the colour of the contaminated ring.

    Eroding the mask would thin the bracket arms, and the ring is WIDER on pale
    coats (a light plank against white has a low-contrast edge, so the render's
    anti-aliasing spreads further). So instead of cutting geometry away, the
    ring's RGB is replaced from the interior and the same colour is pushed out
    into the background — after which the alpha can be feathered without any
    white being revealed anywhere.
    """
    rgb = np.asarray(rgb_img.convert('RGB')).astype(np.float32)
    bg = background_mask(rgb)
    obj = ~bg

    # the band of object pixels that the white backdrop bled into
    near_bg = bg.copy()
    for _ in range(ring_px):
        grown = near_bg.copy()
        for dy, dx in SHIFTS:
            grown |= shift(near_bg, dy, dx, False)
        near_bg = grown
    ring = obj & near_bg
    known = obj & ~ring                      # trustworthy product colour only

    # grow the trustworthy colour over the ring first, then out into the backdrop
    for _ in range(ring_px + bleed):
        acc = np.zeros_like(rgb)
        cnt = np.zeros(bg.shape, np.float32)
        for dy, dx in SHIFTS:
            k = shift(known.astype(np.float32), dy, dx, 0.0)
            acc += shift(rgb, dy, dx, 0.0) * k[..., None]
            cnt += k
        fill = (cnt > 0) & (~known)
        if not fill.any():
            break
        rgb[fill] = acc[fill] / cnt[fill][:, None]
        known |= fill

    alpha = Image.fromarray(np.where(obj, 255, 0).astype(np.uint8), 'L')
    if feather:
        alpha = alpha.filter(ImageFilter.GaussianBlur(feather))
    out = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')
    out.putalpha(alpha)
    return out


def edge_report(path):
    """How much white is left hugging the silhouette — the thing being fixed."""
    im = np.asarray(Image.open(path).convert('RGBA')).astype(np.float32)
    a = im[..., 3] / 255.0
    rim = (a > 0.15) & (a < 0.95)
    if not rim.any():
        return 0.0, 0
    lum = im[..., :3].max(axis=2)
    return float((lum[rim] > 238).mean() * 100), int(rim.sum())


for k in KEYS:
    src = Image.open(os.path.join(SRC, f'fin-{k}.webp'))
    key(src).save(os.path.join(SRC, f'panel-{k}.webp'), quality=92, method=6)

# the uncoated state: key the shiplap render first, then recolour RGB only
base = Image.open(os.path.join(SRC, 'fin-anthracite.webp')).convert('RGB')
keyed = key(base)
alpha = keyed.getchannel('A')
a = np.asarray(keyed.convert('RGB')).astype(np.float32)
g = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
g = (g - g.min()) / (g.max() - g.min() + 1e-6)
raw = np.clip(np.stack([70 + g * 150, 74 + g * 152, 80 + g * 156], axis=2), 0, 255).astype(np.uint8)
rawim = Image.fromarray(raw)
rawim.putalpha(alpha)
rawim.save(os.path.join(SRC, 'panel-raw.webp'), quality=92, method=6)

print('white pixels remaining on the anti-aliased rim (lower is better):')
tot = 0
for k in KEYS + ['raw']:
    p = os.path.join(SRC, f'panel-{k}.webp')
    pct, n = edge_report(p)
    tot += os.path.getsize(p)
    print(f'  {k:12s} {pct:5.2f}%   rim px {n:6d}')
print('panels total', tot // 1024, 'KB')
