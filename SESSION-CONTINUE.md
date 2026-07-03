# Vulcan — Session Continuation

Handoff for picking this up in a fresh chat. Read [`PROJECT-HANDOFF.md`](PROJECT-HANDOFF.md)
for the original project context, **but note it is stale in places** (it still describes the
constellation contact, product-name marquee, factory band, "400 Series" and wedge clip-paths —
all replaced this session; trust this file and the code over it).

Last session: 2026-07-03. Live URL: https://sahan4115.github.io/vulcan-cladding-systems/

---

## ⚠️ First thing to check: the last deploy

Everything is **committed and pushed** (head `a356fad`, working tree clean), but GitHub Pages
was flaky: the `316ea9b` deploy failed twice with a transient *"Deployment failed, try again
later"*. The final push (`a356fad`, hero/nav alignment) superseded it and its deploy was still
running at handoff time. Verify and, if needed, retry:

```bash
cd /c/IPS/vulcan-systems      # cwd resets to C:\IPS between calls — always cd first
gh run list --limit 1         # want: completed success on a356fad
gh run rerun <run-id> --failed   # the transient Pages error clears on rerun (may need 2x)
```

---

## What changed this session (big session — homepage rebuilt piece by piece)

### New / rebuilt sections
- **"Why Vulcan, in three steps." dial** (`.steps`, between certs and projects): pinned
  ScrollTrigger (220%), rotating tick gauge, 3 cards on a level track, snap + drag + click-to-
  travel, static grid fallback. Ported from the Cheam dial (`C:\IPS\cheam-dental\index.html`).
- **Range explorer on the plank stage**: tabs (VulcaLap® / VulcaBar® / VulcaFrame®) swap the
  procedural 3D model with a spin-out/spin-in GSAP tween. `plank.js` exposes
  `initPlank(canvas, {reduce, profile})` → `{ setProfile }`. Profiles keyed
  `vulcalap|vulcabar|s400` (s400 key kept internally; label is VulcaFrame).
  - VulcaLap / VulcaBar are single **ExtrudeGeometry** cross-sections (T&G plank / hollow bar).
  - **VulcaFrame (`s400`) is NOT an extrusion** — it's a portrait **framed screen**: top +
    bottom rails spanned by 6 evenly-spaced **vertical battens with open gaps** (see-through
    brise-soleil), built from merged `BoxGeometry` parts via `mergeGeometries` (three/addons).
    Rebuilt from the client's VulcaFrame reference (was wrongly a plank, then a landscape
    cassette). `buildGeo()` branches on a `build()` method vs `shape()`+extrude. Dims in
    profile units (Wx 15 × Wy 37, scale 0.5); tune batten count/spacing in the `s400.build()`.
  - **QA hook** `window.__plank = { setProfile, still(ry, rx) }` — `still()` holds the model at
    a fixed angle + renders one frame (WebGL, no `preserveDrawingBuffer`, and the idle
    turntable + IO-gated rAF otherwise make captures unrepeatable). Editing `plank.js` has no
    HMR boundary → Vite full-reloads; re-scroll the stage into view to re-init the module.
- **USP ticker** (`.marquee`, directly under the hero): navy rail, spaced uppercase white
  USPs, lblue skewed-plank separators, 30s loop, edge fades, pause on hover. Replaced the
  static benefit strip AND the old product-name marquee (both gone).
- **Certs condensed**: split layout — copy left, hairline-gapped 2×2 cert grid right with
  plank accents. ~520px tall instead of a full viewport.
- **Contact finale = "the facade answers" plank wall** (replaced the floating gallery,
  user wanted interactive + minimal + wow): full-height NAVY stage (`.contact-stage`,
  92vh desktop / 76svh mobile) with a `<canvas class="contact-wall">` drawing horizontal
  cladding courses (~46px each, golden-ratio-staggered vertical joints, lit top lip +
  seam shadow). One virtual light rakes across the wall — the cursor on fine pointers,
  a slow lissajous ambient drift on touch/idle; there's a one-off L→R sweep on first
  scroll-arrival, and **hovering the CTA pulls + tightens the light onto the button**.
  Colour ramp navy→brand-blue→lblue capped at I=0.88 so white copy at the hotspot stays
  ≥5.7:1. All in `main.js` (gsap.ticker + IO gate); reduced-motion = one static settled
  render. Section bg is `--navy` so it flows seamlessly into the footer (one end-wall).
  CTA is now **white with ink text, flips brand-blue on hover** (`.contact .btn-solid`).
  Title lines are no longer offset (stagger translates removed with the gallery).
  The 12 `float/f01–f12.jpg` images stay on disk — CASES (projects carousel) still uses
  f03/f07/f09; the other nine are now unused by the page.
- **Factory band section removed** (image cut per client); `factory.jpg`/`series400.jpg` deleted.
- **Finishes reworked (recolour ONLY the wood + split composition):** the swatcher no longer
  tints the whole image — `finish-scene.jpg` (1376×768) is a fixed base with the **isolated
  planks** on top as `finish-wood.png` (SAME dims, planks baked in at the matched position so
  `object-fit:cover` keeps both registered at every viewport). Registration found by FFT masked
  template-matching the client's `Mask group.png` cutout into their `hf_20260703…` render
  (scale 1.25); the scene was then **recomposed with PIL** — shifted right 270px (right dark
  margin cropped, left backdrop extended from its own edge column + vignette + grain, product
  pixels bit-identical) so the product sits at ~47–96% of frame and the copy owns the dark left.
  Wood layer sits at (648, 277). Both imgs + the tint mask use **`100% 50%` (right-anchored)**
  positioning — keep all three matched. Recolour touches only `.finish-wood`: cedar=none,
  oak/anthracite=CSS filter, **Any RAL**=colour multiplied through the wood-shaped mask
  (`.finish-wood-tint`) so grain shows through. Tune looks in the `FINISHES` map in `main.js`.
  Overlay: vertically centred, no text-shadow, p capped 42ch, chips wrap 2×2 (max-width 24rem);
  the old mid-image scrim (`.finish-overlay::before`) is GONE — navy grade now bottom-anchored
  via `.finish-stage::after`. **Mobile (≤860): stacked, never overlapping** — stage is a flex
  column (`align-items:stretch` — desktop's `center` collapses the content-less media wrapper
  to 0 width), text first, `.finish-media` below at the asset's exact ratio (no crop), section
  bg `#05070c` blends with the render. Old `finish-macro.jpg` + `.finish-tint` path retired.

### Nav / header
- **Utility rail** above the nav: tel + mailto (real: 020 8681 0617 / sales@vulcansystems.co.uk)
  + LinkedIn/Instagram/YouTube icons — **hrefs are `#` placeholders, awaiting real URLs**.
- **Nav is solid white always** (ink links, blue logo) — transparent nav put links over the
  hero image at some sizes.
- **Structure**: Products ▾ (dropdown: 3 systems → `#systems`) / About Us / Downloads (soon) /
  Finishes / Colours (both → `#finishes` for now) / Contact (→ `#contact`).
- Burger takes over at **1024px** (the 5-link row needs ~944px; the old 860 caused overlap).
- Hero content top padding = 114px desktop (utility 38 + nav 76), 126px base.

### System naming
- **VulcaFrame® replaced "400 Series" everywhere** (real third system from
  vulcansystems.co.uk: "Modular, A2 Fire Rated, Built Offsite", 600/900/1200mm cassettes).
  Panel image `vulcaframe.jpg` (generated). Panel taglines (`.hpan-tag`) removed; "View
  system" buttons carry `.btn-arrow`.

### Brand / assets
- **Logo**: the sprite in `index.html` + `public/assets/logo.svg` are **byte-exact from the
  client's supplied SVG** (fills → currentColor only). Do not redraw.
- **Favicon** `public/assets/logo.png`: 128px, white lockup on brand blue, rasterised from
  that SVG via the preview browser canvas (no local SVG rasteriser exists — reuse that trick).
- **Footer**: logo 172px, credit "Design and Development by Vendo Digital", trademark line is
  one sentence ("VulcaLap® and VulcaBar® are trademarks…"), and the big call/email rows were
  removed from the contact section (the footer works column carries them).
- **Media**: 6 big JPEGs re-encoded (23MB → 5MB, ffmpeg `-q:v 2`, same dimensions); hero video
  is the client's new footage at 1080p CRF23 (~4.5MB). ⚠️ Poster `hero.jpg` is still the OLD
  frame — mismatch on first paint; regenerate when there's a frame to match.

### Global styling passes
- **Typography**: headings −0.045em/1.06 + `text-wrap: balance`; hero & finale −0.05em/1.02;
  statement −0.03em/1.34; paragraphs 1.68 + `text-wrap: pretty`; all uppercase micro-labels
  unified at 0.12em tracking.
- **Straight edges everywhere EXCEPT the hero banner** (user call): certs / finishes / footer
  wedge clips and overlap margins removed; skewed plank MICRO-marks (dial numbers, tabs, ticker
  separators, footer hovers) intentionally kept — brand mark, not boxes.
- **Hero media panel clip (rebuilt this pass — no more CLIP_A/CSS duplication):** the whole
  polygon is now driven by one CSS var `--clip-p` on `.hero-media` (0 = banner, 1 = full bleed),
  and `main.js` just tweens `--clip-p` 0→1 on the scroll pin (replaces the old CLIP_A/CLIP_B
  string swap). Geometry lives ONLY in `styles.css` (~line 295):
  - **Slanted (wedge) LEFT edge on the banner** — top-left `52%`, bottom-left `46%` (each
    `× (1 - --clip-p)`), so it flattens to `0%` as you scroll.
  - **RIGHT edge tracks the nav container** at `calc(100% - (var(--gutter) * (1 - var(--clip-p))))`
    → lines up with the "Start a conversation" CTA within ~0.2px at ANY desktop width (verified
    1280/1440/1600/1920), and grows to `100%` on scroll. ⚠️ The parens around the WHOLE product
    are mandatory: `--gutter` is itself a `calc()`, and without them the trailing `+ pad` escapes
    the multiply and flips sign (edge jumps ~128px right).
  - Top/bottom `10%`/`92%` → `0%`/`100%`. On scroll the panel flattens the slant AND goes
    full-screen, then the second-beat headline reveals (~60% through the pin).
- **`--gutter` var** (`:root`): `calc(max((100% - 1560px)/2, 0px) + var(--pad))` — the left
  edge of the centred 1560 container. Used by split-hero content, scroll cue and hero-reveal
  so full-bleed hero text aligns with the nav on ultrawide screens. **Use 100%, not 100vw**
  (vw includes the scrollbar → 8px off).
- Contact CTA is sharp-cornered (pill experiment reverted); `.btn-arrow` is the shared
  arrow-nudge for any button.
- Section kickers/taglines were tried and **removed at user request** — don't reintroduce
  small labels above titles.

---

## Verification & environment notes
- Dev server: `preview_start` name `vulcan-systems`, port 5199 (autoPort on — another chat
  sometimes holds it). `window.lenis` exposed for QA scrolling.
- Preview quirks: panel `visibilityState: hidden` blanks screenshots (rAF throttled); the
  page sometimes reloads between tool calls (do click→wait→verify inside ONE async eval);
  the preloader stops Lenis (`preloader.classList.add('done')` + `lenis.start()` in evals
  before scrolling); emulated-size screenshots letterbox to the native window; the console
  log buffer persists across reloads (drop a `console.warn` marker to separate runs).
- Pinned sections make `rect.top + scrollY` unreliable mid-page — `lenis.scrollTo(0)` first.
- **Hidden panel = no rAF**, so the contact wall canvas never paints in QA evals; call
  `window.__wall.render(x, y)` (0..1 stage coords) to force a settled frame, then read
  pixels via `getImageData` (screenshots time out entirely while the panel is hidden).
- Git identity is set repo-locally (Sahan Liyanage / sahanhliyanage@gmail.com).
- Static ffmpeg (not on PATH): `find "$LOCALAPPDATA/Temp/claude/C--IPS" -name ffmpeg.exe`.
- Image gen: Higgsfield MCP `generate_image`, model `nano_banana_pro` (server maps to
  nano_banana_2, defaults 1k — fine for small assets; pass `resolution: "2k"` for hero-size).
- Deploys: 30s–8min, sequential per push; watch with a background
  `until gh run list … completed …` loop and auto `gh run rerun <id> --failed` — the
  transient "Deployment failed, try again later" clears on rerun (sometimes needs two).

---

## Open follow-ups (most relevant first)
- [ ] **Social URLs** for the utility rail (LinkedIn / Instagram / YouTube are `#`).
- [x] ~~Confirm hero Google rating~~ — the consumer Google-reviews strip was **replaced with a
      specifier-facing credentials cue** ("Independently certified · CWCT tested · ISO 9001 &
      14001", shield-check icon) after a brief-alignment review flagged it as off-tone for the
      premium B2B audience. Built only from certs already asserted elsewhere — no client number
      needed. Reversible if the client would rather show a real rating.
- [ ] **Hero poster** `hero.jpg` doesn't match the new footage — regenerate from a frame.
- [ ] **Inner pages** — Products ×3 (VulcaLap/VulcaBar/VulcaFrame, NBS spec + booking), About,
      Case Studies (filterable), Downloads, Colours, Contact (name+number → Pipedrive). The
      nav dropdown and Downloads/Colours items are positioned to receive real URLs.
- [ ] **Real content pass** — case-study captions/project names/stats are placeholders. The
      gallery is now a **paged carousel**: prev/next arrows + an `NN–NN / NN` counter in the
      `.projects-head`, backed by the `CASES` array in `main.js` (single source of truth). It
      currently holds **6 placeholder schemes** — the original 3 plus 3 extras that reuse the
      contact float images (`float/f07,f03,f09.jpg`) so the arrows have somewhere to go. Swap
      `CASES` for the client's real projects (or wire to a CMS); arrows auto-hide at ≤1 page,
      and the 3 on-screen slots stay the same DOM elements (content swaps on page).
- [ ] **PROJECT-HANDOFF.md refresh** — several sections describe removed components.
- [ ] Dev-stage functional reqs — Pipedrive capture, Calendly-style booking, MS Clarity.
