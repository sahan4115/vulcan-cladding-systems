# Vulcan Cladding Systems — Homepage Handoff

Last updated: 2026-07-02. This is the full context for the Vulcan homepage build so any
new session (or developer) can continue without re-discovering everything.

---

## 1. What this is

A revamped **homepage** for **Vulcan Cladding Systems** — a British B2B manufacturer of
fire-rated aluminium plank & bar cladding systems for high-rise residential buildings.
Current live client site (for reference): https://www.vulcansystems.co.uk/

This is an **Awwwards-style redesign of the homepage only**. Inner pages are not built yet —
all inner-page CTAs are intentionally **non-linked `<button>`s** pending homepage sign-off.

- **Local path:** `C:\IPS\vulcan-systems`
- **Dev server:** `npm run dev` (Vite). Port 5199 preferred, `autoPort` on so it falls back
  if 5199 is taken. launch.json entry name: `vulcan-systems`.
- **GitHub repo:** https://github.com/sahan4115/vulcan-cladding-systems (public)
- **Live URL:** https://sahan4115.github.io/vulcan-cladding-systems/
- **Deploy:** GitHub Actions → GitHub Pages, auto-runs on every push to `main`
  (`.github/workflows/deploy.yml`). ~1–2 min. Vite `base` is set to the repo subpath
  only for `build` (see `vite.config.js`); local dev stays at `/`.

---

## 2. Brand (hard rules — do not drift)

- **Fonts:** Open Sans only (300/400/600/700), self-hosted via `@fontsource`.
- **Palette:** Blue `#005796`, Light Blue `#A7ACD8`, Grey `#BDBFBF`, White. Derived deep
  navy `#04263D` used for the dark colour blocks. Paper `#f4f7fa`, ink `#0e2434`, muted `#3f5b70`.
- **Logo:** new vector wordmark, inline SVG sprite (`#vulcan-logo`) using `currentColor`
  so it recolours per background. White on dark, brand-blue on the solid white nav.
  Standalone file: `public/assets/logo.svg`. Old PNG kept only as favicon/OG image.
- **Corners:** sharp (radius 0) throughout. Signature motif = **diagonal plank wedges**
  (CSS `clip-path`) drawn from the brand guidelines.
- **Theme:** single light theme; dark navy sections are deliberate colour blocks, not a
  theme flip.

### Client content constraints (from the brief — MUST hold)
1. Fire certification is shown as **achieved, never how**. No testing-process detail anywhere.
2. **No technical detail on the homepage** (no dimensions, spans, fixing methods, spec
   tables). Benefit-led, "sell the sizzle."
3. Naming a certification IS allowed (A2 fire rated, CWCT tested, ISO 9001, ISO 14001).
4. Audience is B2B (architects, contractors, consultants). Top-of-funnel only.
5. Nav label: "Galleries" → **"Case Studies"**.

---

## 3. Tech stack

- **Vite** (vanilla JS, no framework) + ES modules.
- **GSAP** + **ScrollTrigger** for scroll animation (pin/scrub/reveal).
- **Lenis** for smooth scroll (`window.lenis` is exposed for QA scrolling in the console).
- **Three.js** for the interactive draggable plank (`src/plank.js`, lazy-loaded when near view).
- All motion is gated behind `prefers-reduced-motion` and behind `gsap.matchMedia()`
  breakpoints (desktop ≥861px vs mobile ≤860px).

### Key files
- `index.html` — all markup + the inline logo SVG sprite.
- `src/styles.css` — all styles (single file). Z-scale documented at top.
- `src/main.js` — all interaction/orchestration.
- `src/plank.js` — Three.js extruded T&G plank (swap for real CAD later).
- `public/assets/img/` — 9 section images (JPEG, ~1600px, art-directed 2K renders downscaled).
- `public/assets/video/hero.mp4` — hero background film (client-supplied, web-encoded ~1.4MB).
- `public/assets/logo.svg` / `logo.png` — logo assets.

---

## 4. Page structure & interactions (top → bottom)

1. **Preloader** — four brand-colour plank bars fix into place, then the wall strips away
   in 5 slats to reveal the hero. 4.5s failsafe so it can never trap the page. Skipped
   under reduced-motion. (Slats have a 1.5px navy box-shadow to hide sub-pixel seams.)

2. **Hero** — has a **scroll-driven wedge transition** on desktop (newest feature, modelled
   on the Cheam Village Dental reference the client shared, adapted to Vulcan's wedge shape):
   - **State A (desktop):** paper background, **ink text column on the left**
     ("The warmth of timber." + subtext + CTAs), the hero **video sits in a diagonal
     clip-path wedge on the right**. Nav flips to dark ink over the light half (`body.hero-a`).
   - **Clean-hero pass (Cheam-style, client request):** CTAs sit **side by side** — solid
     "Explore the range" + underlined text-link "Watch the film" (`.link-cta`, arrow icon).
     Below them a **Google reviews proof row** (`.hero-proof`: G mark, 5 stars, "4.9 ·
     Google reviews" — **rating/count is a placeholder, confirm with client**). Subtext has
     a left hairline border; text column widened to `min(50%, 720px)`. Two interactive
     accents: a **rotating stamp badge** (`.hero-stamp`, SVG textPath "A2 FIRE RATED ·
     MADE IN BRITAIN · VULCAN", 26s spin) straddling the wedge's left edge, and an
     animated **scroll cue** (`.hero-scroll`) bottom-left. Both fade with the wedge
     expansion via `fromTo` (explicit start values — a `.to` locked them invisible after
     a mid-page reload with scroll restoration). Wedge geometry is
     `polygon(52% 10%, 96% 10%, 96% 92%, 46% 92%)` — defined in BOTH `styles.css`
     (static State A) and `CLIP_A` in `main.js`; keep them matched.
   - **Pinned scrub** (`end: +=130%`): the wedge **expands to full-bleed**, the first-beat
     text exits left and fades, the scrim deepens, then the **second beat**
     ("The certainty of aluminium.", `.hero-reveal`) mask-reveals over the full film.
   - Nav goes solid **only after the pin releases** (driven by the hero timeline's
     `onUpdate`/`onLeave`, not a separate trigger — this was a deliberate fix).
   - **Mobile / reduced-motion:** original full-bleed hero, all three headline lines shown,
     static. Nav goes solid at 30px scroll.
   - Headline uses a **per-character mask reveal** on load; emphasis words ("timber.",
     "aluminium.") land as outlined strokes then fill. Words are wrapped so letters never
     break mid-word.
   - **MEDIA SLOT:** `public/assets/video/hero.mp4` is a placeholder (currently a
     client-supplied sunset aerial). Swap the `<source>` for final drone footage; the
     poster is `hero.jpg` (extracted first frame — keep them matched).

3. **Benefit strip** — 4 benefits (A2 fire rated / made in Britain / timber-look / recyclable).

4. **Statement** — large editorial line that lights up word-by-word on scroll
   ("We design, extrude and finish every system in-house…").

5. **Factory band** — diagonal-wedge clipped image with parallax drift.

6. **Marquee** — outlined VulcaLap / VulcaBar / 400 Series with skewed plank separators.

7. **Systems (horizontal pan)** — pinned horizontal scroll-hijack through three full-bleed
   navy panels (VulcaLap®, VulcaBar®, 400 Series) with a progress line. Stacks vertically
   on mobile.

8. **Plank (3D)** — Three.js draggable tongue-&-groove aluminium extrusion. Drag to turn,
   idle turntable, camera pulls back on narrow viewports so it never crops.

9. **Certifications** — navy wedge block with large typographic rows (A2 fire rated / CWCT
   tested / ISO 9001 / ISO 14001) that indent + recolour on hover. Achieved, never how.

10. **Case studies** — expanding accordion gallery (Knights Hill, Merle Court, Leamington
    Court — placeholder captions, confirm per project with client). Hover/tap to expand.

11. **Finishes** — full-screen immersive swatcher; switching finish (Cedar / Dark Oak /
    Anthracite / Any RAL) sweeps a diagonal navy wipe across the plank. `finish-macro.jpg`
    was regenerated (client feedback: product is a **smooth aluminium plank**, not rough
    sawn timber) — it now shows smooth satin woodgrain-coated T&G aluminium planks with
    visible interlock profiles, warm Western Red Cedar base (the JS tints derive Oak /
    Anthracite / RAL from it). Section copy updated to "wood-grain finishes on smooth
    coated aluminium".

12. **Contact ("Have a project in mind?")** — pinned **constellation finale** (Wolverine-
    inspired, Vulcan-flavoured): centred display type with per-character reveal, 8 project
    images float at two depth layers with idle drift + depth-weighted mouse parallax,
    magnetic CTA with soft brand-blue glow. Static text-first fallback on mobile.

13. **Footer** — rebuilt as a full "final course" finale (client: previous slim row was
    too small; giant VULCAN wordmark still banned). Navy wedge-top end-wall with a
    4-column grid: identity (logo kept small at 128px + brand line + cert list),
    Explore nav, Systems nav, The Works (address / phone / email / **live Croydon
    clock**, Europe/London, updates every 30s). Square **magnetic back-to-top** button
    far right. Link hover = skewed plank marker slides in + link shifts right. Legal row
    under a hairline. Signature: **the four preloader plank bars return as the site's
    last course** (`.footer-course` — blue/lblue/grey/white full-width bars that scaleX
    in, alternating left/right origin, on scroll). Grid entrance staggers in via
    ScrollTrigger. Downloads is still a non-linked `.f-soon` button.

---

## 5. Assets & how they were made

- **Images:** generated with Higgsfield (Nano Banana Pro at 2K), art-directed for a
  consistent cool blue-grey editorial grade, then downscaled to ~1600px JPEG q78 via a
  static ffmpeg / System.Drawing. 9 images feed multiple sections (systems pan, case
  gallery, AND the contact constellation all reuse them).
- **Hero video:** client-supplied MP4, compressed with the static ffmpeg binary
  (`@ffmpeg-installer/ffmpeg`, installed in the scratchpad) to 1600px, CRF ~27,
  `-movflags +faststart`, audio stripped. Poster frame extracted from frame 1.
- **Logo:** user-supplied SVG (`Frame 4.svg`), converted to a `currentColor` sprite.

---

## 6. Environment gotchas (Windows / this setup)

- **Git Bash MSYS path conversion** mangles leading-slash env vars (e.g. `BASE_PATH=/foo/`
  becomes `/Program Files/Git/foo/`). Prefix with `MSYS_NO_PATHCONV=1` when needed. The CI
  Linux runner is unaffected, so the Pages build always gets the right base.
- **ffmpeg** is not on PATH. Use the static binary at
  `<scratchpad>/ff/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe`.
- **Preview port:** another chat session may hold 5199; `autoPort: true` handles it.
- **Bash cwd sometimes resets to `C:\IPS`** between calls — always `cd /c/IPS/vulcan-systems`
  in the same command before git operations.
- **Deploy verify:** after push, watch the run with `gh run watch <id>` and curl the live
  URL. Hard-refresh (Ctrl+Shift+R) to beat browser cache.

---

## 7. Outstanding / next steps

- [ ] **Inner pages** — Products (VulcaLap / VulcaBar / 400 Series detail pages with NBS
      spec buttons + booking calendar), About, Case Studies (filterable), Downloads,
      Contact (with name+number capture → Pipedrive). All homepage CTAs currently
      non-linked buttons awaiting this.
- [ ] **Favicon / Apple touch icon** — still the old PNG; regenerate from the new mark.
- [ ] **Hero footage** — current video is a placeholder aerial (countryside, not a building,
      so the hero doesn't *show* cladding — headline carries it). Swap for final drone cut
      of a real completed scheme when shot; keep poster frame matched.
- [ ] **Real content pass** — case-study captions, project names, and any stats are
      placeholders; confirm with client before it goes to their domain.
- [ ] **Dev-stage functional reqs (from brief):** Pipedrive lead capture, Calendly-style
      booking embed on product pages, Microsoft Clarity heatmap.

---

## 8. Commit history (most recent first)

- Hero: scroll-driven wedge expansion with two-beat headline
- Replace logo with new vector wordmark (SVG sprite, currentColor)
- Update project imagery (case studies, tower, VulcaLap, VulcaBar)
- Fix preloader: hide sub-pixel seams between slats
- Regenerate all site imagery at 2K with art-directed prompts
- Typography rhythm pass: leading and vertical spacing
- Simplify footer: real logo left, single slim row, wordmark removed
- Contact finale: pinned constellation of floating project cards
- Hero type: flush-left column, no staggered indents
- Hero char-reveal typography, client video, plank framing fix
- Minimal footer / VULCAN end-wall (superseded)
- Hero drone film, contact takeover, VULCAN end-wall footer

All committed and pushed to `origin/main`; GitHub Pages auto-deploys.
