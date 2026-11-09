# Design

The durable visual decisions behind vulcansystems.co.uk. Written from the built world
(homepage, VulcaLap, cases, About), not from intent. PRODUCT.md owns product truth;
this file owns how it looks and moves.

## The world

Engineered, warm, assured. A precision manufacturer that makes something beautiful.
Every surface should feel machined — straight edges, exact alignment, hairline rules —
but never cold. The plank is the brand: when an idea can be expressed through the
cladding itself, it is.

**One light theme.** Navy blocks are deliberate colour commitments inside it, never a
theme flip. There is no dark mode.

## Tokens

Defined once in `src/styles.css` `:root`.

| Token | Value | Role |
|---|---|---|
| `--navy` | `#04263d` | Committed dark blocks, hero grounds, footer |
| `--navy-2` | `#062f4b` | Second navy, gradient partner |
| `--blue` | `#005796` | The brand blue: links, active states, accents |
| `--blue-deep` | `#00426f` | Pressed / deeper accent |
| `--lblue` | `#a7acd8` | Labels and large text on navy only |
| `--ink` | `#0e2434` | Body text on light grounds |
| `--muted` | `#3f5b70` | Secondary text — tinted from the ink hue, never grey |
| `--paper` | `#f4f7fa` | The alternating light ground |
| `--white` | `#ffffff` | The other light ground |
| `--hairline` | `rgba(14,36,52,0.14)` | Every rule and divider on light |
| `--hairline-light` | `rgba(167,172,216,0.28)` | Rules on navy |

`--pad`, `--gutter`, `--wedge` carry spacing; `--ease` is `cubic-bezier(0.16, 1, 0.3, 1)`
and is the site's only easing curve.

**Type:** Open Sans (self-hosted via `@fontsource`), weights 300/400/600/700. One family
does everything. Display headings run `clamp()` with tracking down to `-0.035em`; body
holds a 46–75ch measure. Numerals in any schedule are `tabular-nums`.

## Component language

- **Square edges everywhere.** No border radius. The skewed plank is the only angle in
  the system, used as a micro-mark (separators, markers) and never at section scale.
- **Rules, not boxes.** A hairline between rows is the preferred container. Cards are
  used only where a record genuinely is a card (the case grid).
- **Ledgers, not icon grids.** Structured content is a schedule or a register with real
  columns — the take-off schedule, the case ledger, the destination register.
- **Sections alternate** `white → paper → navy → white …`. Two adjacent grounds of the
  same value is a defect.
- **No kickers.** No eyebrow label above a heading, anywhere. The heading carries itself.
- **No decorative section numbers.** Numerals appear only where they carry information
  (item codes, quantities, totals).

## Motion

One authored moment per page, plus a single quiet entrance grammar.

- The entrance grammar is `[data-reveal]`: an 18–28px rise and fade, `power3.out`,
  fired once per element by ScrollTrigger. It is the same on every page.
- Each page then earns exactly one authored moment: the homepage's scroll-scrubbed frame
  sequence, VulcaLap's build-up, the case pages' course wipe, About's take-off schedule
  issuing line by line with its total counting up.
- **Everything is gated.** `prefers-reduced-motion` and `html.js` both have a complete
  static path; content is never dependent on script to be readable.
- Lenis drives smooth scroll; GSAP `matchMedia` gates breakpoint-specific work.

## Accessibility

- Body and placeholder text ≥4.5:1; large text ≥3:1. Measured against the actual
  composited pixel behind it, including over photography.
- Secondary text is tinted from the surface hue (`--muted`, `--lblue`), never neutral grey.
- Skip link, `focus-visible` on every interactive element, `aria-current="page"` in nav.
- Every animation has a static equivalent; no content requires JS to be reachable.

## Imagery

Warm, raking-light photography of the material and the facility — racked extrusions,
coated planks, cut plank ends, dispatch, offload. A navy scrim sits over hero photography
so type holds contrast.

**Raster provenance.** Building photography now comes from Vulcan's own project archive
(the "Project photos" Drive folder, shared by the client), so it may be named and captioned
as a record of that project. State only what the folder or file name supports.

| Set | Source | Status |
|---|---|---|
| `img/projects/*.webp` | Client Drive: one folder per project | Real, named after the project |
| `img/apps/app-*.webp` | Client Drive: Titanic Quarter, Islington Gardens, Oakfield | Real |
| `img/about/ab-*.webp` | Client Drive: Fairmont, Underwood Rd, Stanley Rd | Real |
| `vulcalap.jpg`, `vulcabar.jpg`, `vulcaframe.jpg` | Client photos: Titanic Quarter, Merle Court, Greenwich Peninsula | Real |
| `hero.mp4`, `hero.jpg`, `tg150-install.*` | Client footage | Real |
| `vulcalap-buildup.webp` (VulcaLap hero), `finishes/panel-*` | Client renders | Render, not a photograph |
| `finish-scene.jpg` | Client render, source named `hf_...` | Render, possibly AI-assisted; confirm. No photo shows this cutaway. |
| `finishes/tile-*` | Rebuilt in-project | Texture, not photography |

Do not caption a building with a system or finish its Drive folder does not name.

## Anti-references

Carried from PRODUCT.md because they are visual as much as editorial: no consumer trust
furniture (stars, review widgets), no spec tables on marketing surfaces, never show *how*
fire certification is achieved, no generic SaaS grammar (kicker + icon-card grid + pills),
and nothing resembling the old vulcansystems.co.uk stock-block template.
