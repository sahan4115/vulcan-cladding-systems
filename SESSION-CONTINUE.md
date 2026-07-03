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
  procedural 3D cross-section with a spin-out/spin-in GSAP tween. `plank.js` exposes
  `initPlank(canvas, {reduce, profile})` → `{ setProfile }`. Profiles keyed
  `vulcalap|vulcabar|s400` (s400 key kept internally; label is VulcaFrame).
- **USP ticker** (`.marquee`, directly under the hero): navy rail, spaced uppercase white
  USPs, lblue skewed-plank separators, 30s loop, edge fades, pause on hover. Replaced the
  static benefit strip AND the old product-name marquee (both gone).
- **Certs condensed**: split layout — copy left, hairline-gapped 2×2 cert grid right with
  plank accents. ~520px tall instead of a full viewport.
- **Contact finale = floating gallery** (video-reference build): 12 unique Higgsfield images
  (`public/assets/img/float/f01–f12.jpg`, ~480px each) drifting upward forever in 3 depth
  layers (blur/speed/size). Ticker in `main.js` (gsap.ticker + IntersectionObserver gate,
  wrap at `fieldH + 20`). **Field extends 220px below the stage under the footer** so cards
  emerge from behind the footer edge (footer paints above as later positioned sibling).
  Title: "A system built / for every **skyline.**" (2 staggered lines via CSS `translate`,
  deliberately not `transform` so GSAP reveals don't clobber it).
- **Factory band section removed** (image cut per client); `factory.jpg`/`series400.jpg` deleted.

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
- **Straight edges everywhere** (user call, reversing the wedge motif on BOXES): the hero
  media panel is now a rectangle — `polygon(49% 10%, 96% 10%, 96% 92%, 49% 92%)` — defined in
  BOTH `styles.css` (~line 289) and `CLIP_A` in `main.js`. **Keep them matched.** Certs /
  finishes / footer wedge clips and overlap margins removed. Skewed plank MICRO-marks (dial
  numbers, tabs, ticker separators, footer hovers) intentionally kept — brand mark, not boxes.
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
- [ ] **Confirm hero Google rating** (4.9 · review count) with client — still placeholder.
- [ ] **Hero poster** `hero.jpg` doesn't match the new footage — regenerate from a frame.
- [ ] **Inner pages** — Products ×3 (VulcaLap/VulcaBar/VulcaFrame, NBS spec + booking), About,
      Case Studies (filterable), Downloads, Colours, Contact (name+number → Pipedrive). The
      nav dropdown and Downloads/Colours items are positioned to receive real URLs.
- [ ] **Real content pass** — case-study captions/project names/stats are placeholders.
- [ ] **PROJECT-HANDOFF.md refresh** — several sections describe removed components.
- [ ] Dev-stage functional reqs — Pipedrive capture, Calendly-style booking, MS Clarity.
