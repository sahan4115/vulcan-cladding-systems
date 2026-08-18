# Vulcan live-site build-up diagram — hotspot annotations (extracted 2026-08-18)

Source: <https://www.vulcansystems.co.uk/vulcalap-aluminium-cladding/>
Component: **Elementor Hotspot widget** ×2, side by side under the H2
"VulcaLap® Aluminium Cladding by Vulcan Cladding Systems". No tabs — both show at once.

| widget | image | orientation | dots |
|---|---|---|---|
| `48a8f29` | `2025/02/Vulcan-H-1.webp` | **Horizontal** planks | 11 — 1,2,3,4,6,7,8,9,10,**11**,13 |
| `cf362bd` | `2025/02/Vulcan-V.webp` | **Vertical** planks | 12 — 1,2,3,4,**5**,6,7,8,9,10,**12**,13 |

Numbering is ONE shared master list of 13; each diagram shows only its relevant subset.
Both are authored at a 550px-wide box (H 550×661, V 550×869).

## The 13 labels (verbatim from the tooltips)

| # | Label | H | V |
|---|---|---|---|
| 1 | Sheathing board fire rated | ✅ | ✅ |
| 2 | Breather membrane fire rated | ✅ | ✅ |
| 3 | Wall insulation | ✅ | ✅ |
| 4 | Helping hand brackets and vertical cladding rails at 600mm c/c | ✅ | ✅ |
| 5 | Vulcan 25mm ZED section | — | ✅ |
| 6 | VulcaLap® extruded aluminium plank system | ✅ | ✅ |
| 7 | Tenmat NVFB solid-state cavity barrier, 110kg/m3 | ✅ | ✅ |
| 8 | Tenmat NVFB-WB cavity barrier, 45kg/m3, fixed with pigtails to NVFB | ✅ | ✅ |
| 9 | Tenmat FF109 intumescent 12x15mm block | ✅ | ✅ |
| 10 | Tenmat VFB Plus intumescent open-state cavity barrier | ✅ | ✅ |
| 11 | Tenmat FF102/2mm intumescent plate fixed in line with VFB Plus | ✅ | — |
| 12 | Tenmat FF102/50 intumescent 6mm plate fixed in line with VFB Plus | — | ✅ |
| 13 | Flyscreen stainless steel or aluminium | ✅ | ✅ |

## Note before rebuilding this

**Items 7-12 (six of the thirteen) are Tenmat cavity barriers and intumescent
components.** Vulcan publishes these themselves, on their own domain — that is their
decision and this file simply records it. But our 02 section drawing on vulcalap.html
deliberately OMITS them, under the working rule that certification is shown as achieved
rather than explained (see SESSION-CONTINUE.md, "02 section drawing CORRECTED").

So porting this component wholesale would carry across detail our own drawing was built
to leave out, and name a third-party supplier six times. Worth putting to the client
before it is built either way — it is their call, not a rule to enforce.

Subset that matches our current drawing if rebuilt: **1, 2, 3, 4, 5, 6, 13** (seven dots).

## Hotspot positions (% of the image box, centre of dot)

Horizontal (`Vulcan-H-1.webp`):
1 (83.09, 18.53) · 2 (90.65, 29.02) · 3 (87.82, 51.91) · 4 (73.64, 26.16) ·
6 (10.29, 35.69) · 7 (57.56, 23.29) · 8 (48.11, 30.92) · 9 (46.22, 55.72) ·
10 (87.82, 79.56) · 11 (72.69, 76.71) · 13 (91.60, 97.68)

Vertical (`Vulcan-V.webp`):
1 (87.82, 11.41) · 2 (87.82, 19.13) · 3 (29.20, 18.16) · 4 (70.80, 19.13) ·
5 (9.35, 26.84) · 6 (74.58, 50.96) · 7 (54.73, 13.34) · 8 (42.44, 18.16) ·
9 (39.60, 77.02) · 10 (7.45, 69.30) · 12 (25.42, 71.23) · 13 (87.82, 96.31)

Each dot carries a tooltip side config (`e-hotspot--position-left|right` +
`--top|bottom`) so tooltips flip away from the image edge — worth keeping in a rebuild.

## Other products found live (not in our build)
`vulcalucent`, `vulcatuf-rainscreen-cladding-panels`, `vulcan-screen-bar-system`
— our site models only VulcaLap / VulcaBar / VulcaFrame.
