# Vulcan — Session Continuation

Handoff for picking this up in a fresh chat. Read [`PROJECT-HANDOFF.md`](PROJECT-HANDOFF.md)
for the original project context, **but note it is stale in places** (it still describes the
constellation contact, product-name marquee, factory band, "400 Series" and wedge clip-paths —
all replaced this session; trust this file and the code over it).

Last session: 2026-11-09. Live URL: https://sahan4115.github.io/vulcan-cladding-systems/

---

## 2026-11-09 (latest) — VULCABAR AND VULCAFRAME PRODUCT PAGES BUILT

`vulcabar.html` + `src/vulcabar.js`, `vulcaframe.html` + `src/vulcaframe.js`. Shared chrome and the two-step enquiry
dialog live in **`src/product-common.js`** (lifted from vulcalap.js, which deliberately keeps its own copy so the
reviewed VulcaLap bundle is untouched); shared new blocks in **`src/product-blocks.css`**. Both pages import
`vulcalap.css` for `.phero / .po-* / .rec` and the dialog. Every VulcaBar / VulcaFrame link on the site (nav
dropdown, footer, homepage panels' "View system") now points at the pages; two new Vite inputs.

**Pages are assembled, not hand-copied:** the header, mobile menu, footer and dialog are extracted from
`vulcalap.html` by `build_pages.py` (session scratchpad; recipe = split vulcalap.html on its section comments,
swap `aria-current`, the CTA label, the dialog title/sub/options). Edit the shared chrome in vulcalap.html and
re-run, or edit the three pages by hand — just keep them in step.

### Content rule honoured: every fact is from vulcansystems.co.uk, reworded
- **VulcaBar** (`/vulcabar-facade-screen-system/`): A2-s1,d0 to BS EN 13501-1; ISO 12944-6 C4, 25-year seafront
  life; 10-year fade warranty on powder coat; concealed fixings, colour-matched trims, stainless fixings supplied;
  one-part and two-part bars, bespoke sections matched to timber; wood / RAL / Corten / anodised; 10–12 weeks,
  supply only from Croydon; four uses (balcony infills — Millard Road Deptford, timber replacement, façade and
  courtyard screens — Bolanachi, new build); the four-step process; the ten FAQs (also as FAQPage JSON-LD).
- **VulcaFrame** (`/vulcaframe/`): "Modular, A2 Fire Rated, Built Offsite"; widths 600 / 900 / 1200 + Customise;
  substrates brick / cladding / steel / concrete; the 17 WOOD finishes (swatches downloaded from their WOOD page
  into `img/finishes/wood/`, 70 × 350 each). The live page has no body copy at all, so the overview copy is ours and
  stays at those facts; "assembled off site" is their claim, "Croydon works" is NOT claimed.
- **Not claimed anywhere:** that VulcaLap's fire certificate covers VulcaFrame (Vulcan only says it covers VulcaBar,
  on the downloads page); any mechanism of the fire classification; an NBS Source URL (their page says "listed on NBS
  Source" but `source.thenbs.com/manufacturer/vulcan-cladding-systems-ltd` is a 404 — the NBS button opens a request
  email until Vulcan supplies the link, then make it open in a new tab per the brief).

### The 3D on the pages
- **VulcaBar "Turn it over"**: `plank.js` gained `bar-square` (VUL860, 42 × 42 hollow), `bar-two` (VUL825 sleeve +
  VUL801 insert, two meshes, `explode(t)` slides the insert along the bar) and reuses `vulcabar` (VUL850 flat).
  Sections in `src/bar-profiles.js`, sliced from the STEP solids at mid-length (trimesh `section`, shapely simplify
  0.05 mm). Labels one-part / two-part are OUR reading of the geometry + the live gallery caption "42x42mm 2-part
  balustrades"; confirm with Vulcan. Dialog preselects "<bar> in WOOD finish".
- **VulcaFrame hero = the configurator**: same ten GLBs as the homepage tab, five configuration buttons + backing
  sheet toggle, dataLayer `vulcaframe_configure` events, dialog preselects the configuration. `initPlank` starts at
  load here (hero), not on intersection.

### Lead flow (the brief: name + number to Pipedrive; booking calendar; talking-head film)
Hero CTA → sticky rail CTA → evidence-pack request (mailto + `evidence_pack_request` event) → finishes "request a
sample" → **booking block "Ready to discuss your project?"** → finale. Dialog step 1 fires `<page>_lead` with name /
phone / email before the long step; `RQ_ENDPOINT` in product-common.js is the Pipedrive hook. **PLACEHOLDERS,
clearly marked in the markup:** the calendar panel (`.book-cal`, replace with the Calendly-type embed), the
sales-contact avatar (`.book-avatar` initials → real photo + name), and the film slot (`.talk`, poster is a client
photo, film not shot). VulcaLap does not have the booking block yet — add it there for consistency.

### Verified
Desktop 1440: both pages load with no console errors, no missing images, no horizontal overflow; 3D bar stage swaps
and explodes; configurator swaps and toggles; production build passes (vulcabar 91 KB / vulcaframe 78 KB HTML, page
scripts 3–4 KB). Mobile 375 checked for layout and overflow. ⚠️ Same hidden-pane caveat as the homepage: IO-gated
`initPlank` on vulcabar.html does not fire while the pane is hidden; init by hand to test.

### Still open
- Ray's VulcaFrame configuration + sheet choice; Vulcan's own names for the five configurations and the two bars.
- Real sales-contact photo/name, calendar embed, film, Pipedrive endpoint, NBS Source URL.
- Only Greenwich Peninsula has VulcaFrame photos; Vulcan's page shows three unnamed projects — ask for names/photos.
- vulcalap.js still duplicates the chrome; fold it onto product-common.js in one commit when convenient.

---

## 2026-11-09 — VULCAFRAME TAB NOW SHOWS THE CLIENT'S OWN 3D MODELS

Source: Liviu Sofrone's 4 Nov emails (cc Ray, Alfie, Brentleigh): a zip of ten STEP files = **all five VulcaFrame
configurations, each with and without a backing sheet**. Second email: the sheet is **2 mm, not the 5 mm in the file
names**. Liviu asks that **Ray sees two renders of one configuration, with and without the sheet, and confirms which
goes on the site BEFORE it is built in**. That decision is still open, so the stage carries all ten and a toggle.

### What changed
- Homepage "One piece of aluminium" stage, VulcaFrame tab (`src/plank.js`, `src/main.js`, `index.html`, `styles.css`):
  the procedural framed screen (`s400`) is now only the offline fallback. Keys `vf-<config>-<open|sheet>`; configs
  `square-vertical`, `square-horizontal`, `flat-vertical`, `flat-horizontal`, `batten`. A second `.plank-variants`
  group (`data-for="vulcaframe"`) holds five descriptive buttons (no profile codes on the homepage) and a
  `.plank-toggle` for the backing sheet. The option groups now stack in one grid cell (`.plank-options`) so the stage
  never jumps. Default on the tab: square bar · vertical, open.
- GLBs in `public/assets/models/vulcaframe/` (170–400 KB each, 2.9 MB for all ten), **loaded on demand**: nothing
  downloads until the tab is chosen, GLTFLoader is its own chunk. `plank.js` keeps one body in a `holder` group;
  the swap tween shrinks the holder, waits for the GLB, grows it back, and a newer pick cancels an older load.
  Frame bodies use a flat-shaded clone of the stage material (the files carry no normals), the sheet a darker clone.
  Camera sits closer for frame bodies on portrait stages (52 vs 72) because the panel is tall, not long.

### What the models are (measured from the geometry; the client's names, not a spec)
600 × 2700 mm panel. Frame: VUL802 42 × 42 rail with the VUL804 39 × 40 insert sleeved inside. Infill: VUL860
42 mm square bars (7 vertical / 20 horizontal), VUL850 100 × 21.5 flat bars (4 vertical / 14 horizontal), or
VUL825 + VUL801 two-part 42 mm bars (7 vertical, on two 25 × 50 rails behind, no top/bottom rail). Sheet as
modelled: 5 mm, 610 wide (overhangs the 600 frame by 5 each side). The live site only says 600 / 900 / 1200 mm
widths; every file is the 600.

### Conversion pipeline (no CAD licence; scripts were in the session scratchpad, recipe here)
`pip install cadquery trimesh` → `cq.importers.importStep` → per-solid `tessellate(tol, 0.6)` with tol relative
to each part's size → `trimesh` GLB. Drop solids whose longest side < 30 mm (36 screws/washers/nuts and, in the
batten file, 13 clips that held 1M of its 1.5M triangles; all hidden behind the bars). **Five of the ten files are
exported at the wrong scale (three at 10×, the batten-open file at 25.4×)**: normalise so the panel is 2700 tall.
Orientation baked: longest axis → Y, thinnest → Z, sheet centroid on −Z (the open sibling takes the sheet file's
decision). Export with merged vertices and no normals; let the material flat-shade.

### Open with the client
- **Ray's choice**: which configuration and sheet/no sheet. Comparison sheets for him are in
  `C:\IPS\vulcan-3d-review\compare-*.jpg` (neutral grey, not a Vulcan finish). Once he picks, make it the default
  and decide whether the other options stay on the site.
- Sheet 5 mm vs 2 mm: correct the CAD or thin it ourselves (at stage scale it is invisible either way).
- Only 600 mm panels supplied; the labels "Square bar / Flat bar / Batten screen" are ours and need Vulcan's names.
- Finish: the stage shows raw aluminium. If Ray wants a wood or RAL finish on the frame, wire the existing swatch
  logic to `frameMat`.

### Verified
Dev server (`vulcan-cladding` entry in `C:\IPS\.claude\launch.json`, port 5265, runs this checkout's Vite with the
root as an argument because launch.json cannot `cd` outside the project). Desktop 1440 and 375 px: all ten GLBs load
(200), swap, toggle, no console errors, no horizontal overflow. `npm run build` passes; the GLB URLs carry the Pages
base path. ⚠️ The in-app browser pane is hidden while Claude drives it, so IntersectionObserver and GSAP tweens
stall there: the lazy `initPlank` never fires and swaps freeze mid-tween. Init it by hand
(`import('/src/plank.js')`) or verify in a visible window; it is not a site bug.

---

## 2026-11-02 — AI IMAGES REPLACED WITH THE CLIENT'S PROJECT PHOTOS

Source: https://drive.google.com/drive/u/0/folders/1DeVslVcu3MDktK_zN0lunqMqcWnUOOzJ ("Project photos", 29 project
folders; folder names carry project, system and finish). The Drive connector cannot list it; the built-in browser can.

- **New `img/projects/`** holds the case and carousel images. Old `cases/`, `float/`, `case-*.jpg` and the about
  stand-ins are deleted. `apps/app-*.webp`, `about/ab-hero.webp` and `vulcaframe.jpg` keep their names with new photos.
- **Kept, verified real by aligning them to the Drive files:** `vulcabar.jpg` is an exact crop of Merle Court `4 IMG_1072.JPG`;
  `vulcalap.jpg` is an exact, darkened crop of `Titanic - Greggs Soffit.jpg`. Earlier notes calling all
  rasters generated were wrong. The old "Meridian Works" image was Azure, Plymouth, and "Leamington" was Hornsey Street.
- **VulcaLap hero is now static** (Sahan's call, 2026-11-02): Vulcan's own `vulcalap-buildup.webp` beside the headline,
  with the three-line legend under it. The AI frame sequence, `src/buildup.js`, the pin, the callouts and the scroll
  rail are gone (`facade.js`, the older procedural hero, stays on disk but is not imported). This also settles the
  open "first fold" question below. The render is only 591x710, so **get a high-res copy from Nick**. Section 02
  now shows the real Stanley Road close-up, so the render is not repeated.
- **Possibly AI, unconfirmed:** `finish-scene.jpg` (homepage cutaway) came from a client `hf_...` render, so it may be AI-assisted; confirm.
- **No delivery or factory photos exist in the folder.** About's racking, cut-end and hiab shots became real plank and
  bar close-ups and a scaffold-level shot; two captions changed. The hero is Fairmont's finished panel in the workshop.

**Facts had to change with the photos, because real buildings cannot carry invented records:**
- Merle Court is really VulcaBar 70 x 42 in RAL 1001 (was VulcaLap T&G150 Dark Oak, 18 occupied storeys, EWS1 story).
  Knights Hill is VulcaLap TG150 in RAL (was TG125 Western Red Cedar, planning story).
- Both case pages: invented story, area, programme, value and dates removed; replaced with a short description of what
  the photos show. **This copy is a stopgap for the real project story; ask Vulcan.**
- Register and carousel: Ashdown, Meridian, Riverside, Harbour View and Elmwood replaced by Oakfield, Azure, Greenwich
  Peninsula, Winnipeg & Hanover and Underwood Road. "Completed" column dropped (no real dates).

**To confirm with the client:** real project stories and figures; RAL numbers for Azure, Knights Hill and Greenwich
Peninsula; the exact Leamington Court location (shown as London, from the skyline in its photos); VCS file references
(still indicative); permission to name Mace or other parties (not named on the site). Trident Point has a strong
professional shoot but no system in its folder name, so it is unused; if confirmed, it is a great hero candidate.

---

## 2026-11-02 — HOMEPAGE 3D STAGE: REAL SECTIONS FROM THE CLIENT DWGS

The four DWGs (`VULTG150`, `VULTGS125`, `VUL400`, `VUL850`) are **2D sections, not 3D models**;
`plank.js` extrudes them to a 300 mm length, all at scale 0.78 so their sizes compare true.
- **VulcaBar tab** = VUL850 (100 x 21.5 mm, hollow, two screw ports). `src/vul850-profile.js`.
- **VulcaLap tab** gets a section switch (`.plank-variants`, only shown on that tab): T&G150
  (unchanged; the DWG's 144 vertices sit within 0.0005 mm of `tg150-profile.js`), TG125
  (`tgs125-profile.js`) and 400 Series (`vul400-profile.js`). 400 Series sits here because the
  client confirmed it is a VulcaLap sub-variant (2026-07-21) and the DWG is labelled "Plank VUL400".
- **VulcaFrame is still the procedural framed screen**: none of the four is a VulcaFrame drawing,
  and the frame was a client correction, so it was not swapped for an extrusion.
- Portrait stages pull the camera back (z 58 → 72); no profile clips on a phone at any angle.

**Extraction:** none of this needs a CAD install. `@mlightcad/libredwg-web` (GPL, so keep it out of
this repo) reads the LWPOLYLINEs and their bulges; VULTG150 is a single-face ASM region that
LibreDWG skips, so its SAB was read from the `AcDsPrototype_1b` section. Drawing quirks to expect:
VUL400's polyline retraces its first leg, and VUL850's cavity spans two overlapping polylines.

**Open with the client:** vulcalap.html calls 400 Series the option "for wider layouts", but the
VUL400 plank is 92 mm wide, narrower than TG125 and T&G150. Still needed: a VulcaFrame drawing.

---

## 2026-10-22 — ALFIE'S 16 OCT REVIEW APPLIED (branch `alfie-feedback-2026-10-16`, NOT deployed)

Source: the Fathom recording of the 16 Oct call with Alfie ("Vulcan Inner pages"). All work
is on the branch; `main` (which auto-deploys to Pages) is untouched.

### Done
- **Homepage hero = Alfie's showreel stage** (`src/hero-showreel.css/js`, all `.sr-*`). Ported
  from his standalone `vulcan-showreel.html` (Downloads). He asked for HIS build, not a
  rebuild, minus the reel numbers: the REEL 01 tag, timecode/acts, SHOT nn/09 slate, shot index
  and the "Hero exploration 02" strip are gone. His HUD logo row is dropped (site nav covers
  it). His boot mark + shutters replace the slat **preloader**, which is removed from the
  homepage (two curtain reveals back to back otherwise). His reel is byte-identical to
  `hero (1).mp4`, the client clip already in the repo as the faststart remux, so no new video.
  Secondary CTA is "Start a conversation" → contact.html (his said "Full site"). Anton +
  IBM Plex Mono are self-hosted via @fontsource (his file used Google Fonts). Reduced
  motion holds the film on its poster.
- **Homepage finishes** (the 21:00 item, "remove inaccurate/complex colour component"): the
  cutaway no longer recolours its planks through a filter + wood mask (Dark Oak just
  darkened it and left gaps). The render stays as shot; the range is a static swatch strip
  from the client's finish renders + "See every finish" → vulcalap.html#finishes.
- **Homepage plank** (`plank.js`) now extrudes the real **TG150 section** from Nick's DWG,
  316 points in `src/tg150-profile.js` (lifted from Alfie's `TG150_viewer.html`), flipped
  face-side to camera. VulcaBar / VulcaFrame are still procedural.
- **VulcaLap**: 02 drawing → Vulcan's own build-up render (`vulcalap-buildup.webp`, 591x710,
  from their live page; get high-res). 03 metal plate → plain white evidence schedule (no
  sheen, fixings, engraving, cutting pass or tilt; selection + mailto unchanged). 05 coat →
  one panel + swatch list, hover/focus/tap shows the finish (no pin, pour, bands or building
  resolve; the old coat-arch also pointed at the renamed `case-knights.jpg`). Finale wall is
  drawn once, evenly lit (no cursor spotlight) and `data-magnetic` is off on this page.
- **Case studies**: `.tx` before/after wipe and `.cs-survey` aerial section removed from both
  project files (Vulcan supply only, so no before photos exist; no aerial footage exists).
  `kh-before`, `mc-before`, `kh-aerial` deleted.

- **RAL colours page** (`ral-colours.html`, `src/ral-colours.js/.css`; Sahan confirmed 22 Oct).
  All 187 codes, names and chip colours come from Vulcan's own chart PDF: chips are sampled
  from the PDF's swatch images; names the text layer garbles (3007-3014, 6026-6033, typos,
  "20 03") use standard RAL Classic names. Search by number/name, family tabs (counts
  derived), shareable `?family=` / `?q=`, pick a swatch for a pre-filled sample mailto
  (`ral_colour_pick` dataLayer event). No JS: full chart, controls hidden. Every nav "RAL
  Colours" link (8 pages) now points here; Downloads "Choosing a finish" lists it; the PDF
  stays linked from both pages. Reuses .dl-hero/.dl-tabs, so it imports downloads.css.

### Still open — decisions, not code
- **VulcaLap first fold** (the scroll build-up with callouts): Fathom's summary says remove
  the "pop-out" animation, but Alfie never clearly rejected it in the transcript. Ask him.
- **Homepage** still has the cursor-lit contact wall and magnetic CTAs; Alfie's spotlight /
  wobble comments were made on the VulcaLap page.
- **Lost hero copy (SEO)**: the Vendo schedule's hero sub-line ("…designed, extruded and
  finished in Britain, for performance that matters") and the "A2-s1,d0 classified · CWCT
  tested" strip went with the old hero. Alfie's kicker reads "A2 fire-rated · CWCT tested".
  Decide whether his hero should carry the sub-line.
- **Case studies are still placeholder schemes with generated images.** Alfie: no stock
  images at all. Real photos must NOT go under invented names, so this needs the client's
  real project list + photos (ask Nick). Known real projects from their files: Mace
  Greenwich (VulcaLap TG125, Western Red Cedar), Bolanachi Phase 1.
- **04 Applications** images are generated too; swap for client photography.
- From Nick: DWGs for VulcaBar, VulcaFrame and VulcaLap TNG 120/180, high-res plank images
  for accurate swatches, client project photos.

### Verified
Production build with the Pages base path: every src/href/poster and every JS-built image URL
resolves (0 missing). Homepage hero at desktop and 375px (no horizontal overflow; CTAs wrap),
act/accent swap follows the cut list, page script runs end to end. Plank renders the TG150
face. VulcaLap 02/03/05/finale in browser, finish hover swaps panel + readout, no console
errors. Case pages: section order cs-hero → cs-open → cs-constraint → gal → cs-record → cs-spec.

---

## 2026-08-19 — DOWNLOADS PAGE BUILT (`downloads.html`)

Replaces the `#downloads` homepage anchor. Rebuilt from the **real** inventory at
`vulcansystems.co.uk/vulcalap-vulcabar-downloads/`, fetched and verified, not from the
homepage's list.

### 🔴 THE HOMEPAGE `#downloads` SECTION LISTS DOCUMENTS THAT DO NOT EXIST
`index.html`'s section offers **EPDs, Revit/BIM objects, installation guides and
"25-year finish warranty terms"**, and says "Direct downloads are being prepared."
None of those appear in Vulcan's published document set, four direct downloads DO exist,
and the warranty claim was already flagged unconfirmed earlier in this file. **The new
page deliberately does not carry them.** The homepage section still does — worth cleaning
up, and worth asking the client whether EPDs/Revit exist at all.

### The idea: what you can have now vs what you ask for
Their page presents eight items as one flat list of "Click here" links. Four are a click
away; four are controlled documents that come back by email. That split is the page.

- `.dl-reg` / `.dl-item` — one schedule, four columns (marker · document · meta · action).
  The marker is the brand's skewed plank: **filled** = in hand, **outline** = on request.
  Action reads `Download ↓` or `Request →`, with the chevron rotated per kind.
- **Real file sizes** — 7.7 MB / 9.8 MB / 138 KB / 561 KB, taken from the live PDFs'
  Content-Length, because a 9.8 MB download on site wifi is worth knowing before clicking.
  All four URLs return 200; they are absolute to vulcansystems.co.uk so they work here and
  on the production domain.
- `.dl-tabs` — All / Download now / On request. **Every count on the page is derived from
  the rows** (tab counts and both hero figures), same discipline as the take-off total and
  the cases tabs, so a figure can never drift. Syncs to `?show=`, so a filtered view is
  shareable. Verified 8 → 4 → 4 → 8.
- The authored moment is the filter reflow, via **GSAP Flip** (already a dependency).
- ⚠️ `.dl-item[hidden]` needs `display: none !important` — it is a grid, which beats the
  UA `[hidden]` rule. Third time this trap has appeared (case cards, register rows).

### One certificate, both systems
Their most useful fact, currently buried in a run-on sentence: the systems are the same
extrusion and finishes, so VulcaLap's reaction-to-fire certification **applies to
VulcaBar too**. Given its own navy section with the ratings ledger — RAL A2 / WOOD A2 /
Anodised A1. All verbatim-derived from their page; no mechanism is described, so
PRODUCT.md's "never show HOW fire certification is achieved" holds.

### 🔴 SECOND HALF OF THE about.css → styles.css MOVE
The contact build moved `.ab-sec/.ab-inner/.ab-head` into `styles.css` but **left the
responsive override behind** in about.css (`.ab-hero-row, .ab-head, .ab-ship { 1fr }`).
So `.ab-head` stayed **two columns on phones** for every page that does not import
about.css — that shipped live on **contact.html** and was caught here by looking at a
mobile screenshot. The `.ab-head` half of that rule now lives in styles.css under its own
900px query; about.css keeps `.ab-hero-row, .ab-ship`. **Lesson: when promoting a shared
primitive, move its media queries with it.**

### Verified
All 15 contrast probes AA or better (hero lede 10.98:1, tab count 7.49:1, doc title
15.9:1, meta label 7.14:1, request action 7.14:1, finish copy 6.64:1); filter 8/4/4/8 with
derived counts and URL sync; no horizontal scroll at 1280 or 375 with 0 offending
elements; register collapses to marker + content on mobile with 42px tab taps; `.ab-head`
now single-column on downloads, contact AND about at 375px; no console errors;
`detect.mjs --json downloads.html` → **[]** (still DEGRADED — undercount, see earlier
entries). **Walked the whole page in screenshots at desktop and mobile before shipping.**

### Wiring
24 Downloads links rewired across all eight pages (index, vulcalap, cases, about, contact,
both case pages, downloads itself); `aria-current="page"` on all three; 8th vite input.
The homepage keeps its `id="downloads"` section — now orphaned by nav, see above.

### ⚠️ Routing decision to confirm with the client
Their live page cc's **ray.cooper@vulcansystems.co.uk** on the certificate requests. The
new page routes everything to **sales@** instead, to avoid hard-coding one person's
address into the site. If certificates genuinely need Ray, add the cc back into the four
`mailto:` subjects.

---

## 2026-08-19 — CONTACT PAGE BUILT (`contact.html`) + FIRST DEPLOY OF THE WHOLE PENDING SET

A real contact page, replacing the `#contact` anchor every nav pointed at.

### Flow
hero (navy, no photograph — the ask is the only thing on it; H1 "Send us **the drawings.**"
with email + phone already visible) → **the enquiry form** (white) → **What happens next**
(paper, their own three-step process) → **Coming to see us** (navy, the appointment-only
line). The shared `.contact` CTA band is deliberately **omitted** — this page *is* that ask,
so repeating it at the foot would be asking twice.

### 🔴 THE FORM HAS NO BACKEND — it composes a pre-filled email
There is no form endpoint on this build. Rather than ship a form that silently drops
enquiries, submit builds a `mailto:sales@vulcansystems.co.uk` with subject and body
pre-filled and sets `location.href`. Verified composition:

- subject follows the site's existing convention — `Take-off request — Harbour View, Bristol`
  (the `What do you need?` select supplies the prefix: Take-off request / Product enquiry /
  Document request / General enquiry, matching the `?subject=` links used elsewhere).
- body carries name, company, email, optional phone, optional scheme, then the message.
- 451 chars encoded on a realistic enquiry — well inside the ~2000 char mailto limit.

**If the client wants a hosted form, wire an endpoint (Formspree/Netlify/Basin) into the
submit handler in `src/contact.js` and keep the mailto as the no-JS fallback.** The page
note under the button tells the visitor the email will open, so the behaviour is not a
surprise — update that copy if a real endpoint lands.

### Validation
Hand-rolled, not native bubbles, so the messages match the page's voice. Verified: empty
submit flags **4 fields with 4 visible errors**, sets `aria-invalid` and focuses the first
bad field; a malformed email is caught on its own; a valid submit clears everything and
writes a live-region status line. Errors clear on re-entry, never while first typing.

### 🔴 A REAL BUG THIS SURFACED — shared section furniture had to move
`.ab-sec`, `.ab-sec--white/paper/navy`, `.ab-inner`, `.ab-head` lived in **about.css**.
`contact.html` imports only `styles.css` + `contact.css`, so it rendered with **no section
backgrounds and no gutters at all** — caught by a contrast probe reading 1.00 on the navy
block. Those primitives now live in **`src/styles.css`** (which every page imports) and were
removed from about.css. **About was re-verified afterwards and is byte-identical in
behaviour** — same grounds, 115.2px section padding, 1560px inner, 6 register rows.
Any future inner page can now use the `.ab-sec` stack without importing about.css.

### Wiring
All **21 Contact links rewired** to `contact.html` (3 each across index, vulcalap, cases,
about, both case pages, and contact itself). Note index.html used a bare `#contact`
in-page anchor while the others used `./#contact` — both forms were caught. The homepage
keeps its `id="contact"` CTA section; only the nav/footer links now leave the page.
`aria-current="page"` on all 3 contact links. 7th vite rollup input added.

### Verified
All contrast AA or better (hero lede 14.47:1, hero direct links 15.56:1, field labels
14.79:1, form note 7.14:1, step body 6.64:1, error text 6.22:1, visit copy 14.47:1);
no horizontal scroll at desktop **or 375px** with 0 offending elements; form stacks to one
column on mobile with 56px inputs and a 70px full-width submit; labels all bound to inputs;
no console errors; `detect.mjs --json contact.html` → **[]** (still DEGRADED — see the About
entry; findings are an undercount). Built subpath assets all resolve under
`/vulcan-cladding-systems/`, every referenced file present.

### 🔴 THREE FIXES AFTER THE FIRST DEPLOY — the page shipped visibly broken
The first deploy passed every programmatic check and still looked wrong, because those
checks measured computed styles rather than the rendered page. **Take a screenshot.**

1. **`.ct-steps li` grid mis-placement.** Two columns (`3.5rem minmax(0,1fr)`) with THREE
   children — `::before`, `h3`, `p`. Auto-flow put each `<p>` into the **56px number
   column**, wrapping one sentence into a ~300px-tall ribbon and inflating the section
   from 847px to **1707px**. Fixed with explicit `grid-column: 2` on both `h3` and `p`.
   ⚠️ It stayed invisible in screenshots because those elements were still `opacity: 0`
   awaiting their `[data-reveal]` trigger — so measure element heights, not just overflow.
   Any `.ab-sec` list with a counter `::before` needs the same explicit placement.
2. **THE ADDRESS EXISTED ALL ALONG.** `4 Imperial Way, Croydon CR0 4RR` sits in the
   `<address>` block of **every page footer**. The earlier claim that Vulcan publishes no
   address was wrong — it came from grepping for "Road"/"Estate"/"Unit" and never checking
   the `<address>` tag. A "Coming to see us" section with no location is broken on its
   face; the address is now the first row of that ledger. **Opening hours genuinely are
   absent** — those are still owed.
3. **Form fields were styled at divider weight.** Inputs used the `--hairline` (0.14 alpha)
   that separates table rows, giving a border-to-field contrast of **1.64:1** on a fill
   only 1.06:1 from the page — neither cue identified the control, so empty fields read as
   unstyled. Now a `--paper` fill with an `rgba(14,36,52,0.52)` edge = **3.32:1**, clearing
   the 3:1 floor for a UI component boundary; hover 0.68, focus lifts to white plus the
   blue ring.

### ⚠️ Still owed from the client — do not invent these
**No opening hours** appear anywhere in Vulcan’s material, so the page has none. The
postal address DOES exist — 4 Imperial Way, Croydon CR0 4RR, in every page footer — and is
now the first row of the visit ledger. The premises copy “access to our warehouse and head
office is by appointment only” is used verbatim. A contact page normally carries an address
— **ask the client for it**, plus hours, and a company registration number for the footer.

### 🚀 Deployed
This push was the **first deploy of the entire pending set**, not just the contact page:
About, cases.html + both case-study pages, the VulcaLap changes and the client install
video all went live with it. All pages carry `noindex` (C2 staging preview). ⚠️ **That means
the placeholder scheme records (Merle Court, Knights Hill et al.) are now publicly reachable
for the first time** — they are still placeholder and must be replaced before the production
domain.

---

## 2026-08-19 (later) — ✅ ABOUT REDESIGN SHIPPED: destination-led ("Where it goes")

The paused /impeccable run is **finished**. Direction locked by the user on the re-rolled
hand; page rebuilt, verified, DESIGN.md written. Seed key `ae8b7015`.

### ⚠️ The recorded resume command in the old entry was WRONG — don't copy that pattern
It was `--scope surface … --register safer`, which the seeder rejects twice: `--register`
needs `--reroll <n>`, and then **`--register` applies to `--scope direction` only**. Root
cause: round 0's decision page offered the safer/bolder register buttons on a **surface**
round. Per serve-question's own contract the registers belong to direction rounds; a
surface payload ships plain `reroll: true`. The valid resume was:

`node .claude/skills/impeccable/scripts/concept-seed.mjs --scope surface --mode persuade --from ae8b7015 --reroll 1`

"safer" is then carried by *you*, in how the grounded candidates are derived — it is not a
flag at surface scope.

### The round
Re-roll round 1 dealt **6, 4, 2 (6 leads)**; round 0's three are eliminated. Cards served
code-led with wireframes. **The user picked index 4, "Where it goes"** (a dealt alternate,
not the lead), no steer, build path `code`. No telemetry ping was sent: grounded picks send
no name, and none of the four ping kinds (assigned/pick/challenger/canon) describe a dealt
alternate — reporting `assigned` would have falsely said the lead won.

### 🔴 THE MAP WAS CUT, DELIBERATELY — do not add one back
The chosen card's viewport promised "a drawn UK & Ireland". **It was cut on provenance
grounds.** The only geography Vulcan actually publishes is "overnight pallet/parcel, UK and
Ireland". The eight named schemes in `cases.html` (Merle Court, Knights Hill, Ashdown
Primary, Meridian Works, Leamington Court, Riverside Quarter, Harbour View, Elmwood Court)
are **PLACEHOLDER records** — see the "Register/detail content … is PLACEHOLDER" note
further down this file. Pinning them to a national map would present invented projects as a
factual coverage claim on the company's About page. Geography is therefore **stated, never
drawn**: the `.dst-reach` line. If the client supplies a real project list with locations, a
map becomes buildable — not before.

### What the page is now
Destination-led. Order: hero → **Where it lands** (the spine) → **To site** (delivery) →
Counted before it is cut (the take-off) → What we make → Ethos → In their words →
Questions → contact. Delivery sits **immediately beside** the destinations on purpose: the
chosen thesis was delivery-as-structure, so the argument reads destination → how it gets
there → why it is right when it arrives. Moving it there used only existing verbatim copy.
Ethos dropped from first to fifth; the six sectors were promoted from a small footnote list
to the page's opening statement at **display scale (46px desktop / 25.6px mobile)**.

- `.dst` / `.dst-row` — six rows, two columns (sector | what it does there), hairline
  between. Rows not cards. Copy is their own market language, verbatim.
- `.dst-reach` — the honest geography, plus "which of the six it is changes the schedule,
  never the standard".
- Grounds re-alternated white → paper → navy → white → paper → white → paper (the reorder
  had left two adjacent papers and two adjacent whites). **0 adjacent clashes.**

### Removed on craft-floor grounds (do not reintroduce)
- **All 7 `.ab-no` kickers** ("01 — Ethos" etc.). An eyebrow above a heading is a hard ban
  in craft-floor.md *and* a PRODUCT.md anti-reference. CSS rules deleted too.
- **The three `.ab-eth-n` ordinals** (01/02/03 on the ethos principles) — decorative
  section numbering carrying no information.
- Numerals now survive **only** where they inform: the take-off's codes, quantities, total.

### ⚠️ A wipe animation was built and then deliberately removed
`.dst-row::after` originally wiped a rule in on scroll (`.is-in` via ScrollTrigger). It was
cut for two reasons: it could not be verified in this environment (see below), and the page
already has its one authored moment. The rules are now plain `border-bottom`, present
unconditionally — no JS dependency, no override chain, nothing to fall back from. The rows
ride the existing `[data-reveal]` rise like everything else. Page JS is back to **6.59 kB**.

### 🔴 VERIFICATION TRAP — the preview pane does not composite in this session
`computer{action:"screenshot"}` times out ("the Browser pane is not displayed"), and because
of that **rAF is suspended**: Lenis will not scroll, GSAP tweens never advance, every
`[data-reveal]` element reads `opacity: 0`, and `getComputedStyle(el,'::after')` returns a
stale value that never recalculates. **None of that is a page defect** — it is the same trap
the previous session hit, which is why `window.__tk` exists as a QA hook. Verify motion by
driving state directly, or on a real browser. Static/structural checks are trustworthy.

### Verified
Section order and grounds; 6 register rows; no horizontal scroll at 1265px **or 375px** (0
overflowing elements); register stacks to one column on mobile; schedule still drops its 4th
column and measures 334px inside 335px; **all contrast AA or better** — register name
15.9:1, descriptions 7.14:1, navy lede 14.47:1, schedule caption 6.64:1; `aria-current` on
all 3 About links; no console errors. **Take-off invariants re-checked after the restructure:
8 rows in markup and `sum(data-qty) = 535 = data-total`, still derived in JS, never literal.**
Production build clean, and the direction contract (with seed key `ae8b7015`) **survives into
`dist/about.html`**.

### Exit conditions discharged
Direction contract as first child of `<body>` (150 words, cap 150, verbatim FINISH line) ·
seed key greppable in the built output · `detect.mjs --json about.html` → **[]** · DESIGN.md
written at finish from the built world.

⚠️ **detect.mjs ran DEGRADED** — `htmlparser2`, `css-select`, `css-tree` and `domutils` are
not installed in the skill, so custom properties, selector matching and computed contrast
were **not** evaluated. `[]` is an undercount, not a clean bill of health. The contrast
figures above were measured independently in the browser, not by the detector.

### Note on the em-dash advisory
The detector's first run flagged 16 em-dashes. One was mine and was rewritten; the remaining
**14 are in verbatim client copy** and were left alone rather than break provenance.

### Still open
- **DESIGN.md is new** (`context.mjs` had reported `INCUMBENT_WORLD_UNDOCUMENTED`). It
  documents the world as built across all four page types — check it before the next
  visual change, and keep it current.
- The two content constraints from the old entry **still stand**: no company history and no
  statistics anywhere in their material, so no founding timeline and no animated stats
  without real client-supplied facts. `where-it-goes` needed neither.
- Client photography still owed; `ab-pack.webp` remains unused.

---

## 2026-08-19 — ABOUT PAGE BUILT (`about.html`, `src/about.css`, `src/about.js`)

A replacement for vulcansystems.co.uk/about-us/, built from **their own live copy**
(scraped, not invented) around one argument taken straight from their FAQ:

  **"No. We are supply only."** They never set foot on the building — so everything
  has to be right before it leaves them. All four of their client testimonials
  independently praise exactly that: the take-off, the schedule, the packaging, the
  delivery arriving as promised. H1: "Everything right, before it leaves."

### Flow
hero (navy, factory image at 0.5 + scrim) → **01 Ethos** (their three principles,
near-verbatim) → **02 THE TAKE-OFF** (signature) → **03 What we make** → **04 Where it
goes** (six sectors) → **05 To site** (navy; the distribution promise) → **06 In their
words** (the four real testimonials) → **07 Questions** (native `<details>`) → contact wall.

### The signature: THE TAKE-OFF (`.tk*`)
Their estimating team prices a facade off the drawings; the Alifit testimonial describes
"a spreadsheet for areas and numbers of material including lengths with all quantities of
ancillary items and spares". So the page shows that document **issuing itself line by
line** on scroll, with the item count totalling as it goes.
- ⚠️ **The count is DERIVED from the issued rows** (`sum of data-qty`), never a separate
  number — so the figure and the visible rows cannot drift. Verified: 0/244/299/498/535
  against row-by-row expectations, ending exactly on the stated total.
- ⚠️ **The schedule is complete without JS.** All 8 rows and the 535 total are in the
  markup; CSS only dims un-issued rows under `html.js:not(.reduced)`. Verified: both
  reduced-motion and no-JS render every row at opacity 1.
- The 4th column is hidden below 900px (`.col-sec`) — a 4-column schedule cannot survive
  375px. Table measures 334px inside a 335px doc, no overflow.

### Copy provenance — IMPORTANT for the client review
**Verbatim / near-verbatim from their site:** ethos (integrity, supplier relationships,
sustainability + innovation), products (fire-rated plank and bar, standard and bespoke,
short lead times), markets and applications, the whole distribution section (overnight
pallet/parcel UK & Ireland, pre-delivery call re offload machinery, Hiab on request, JIT
stock kits, batches planned to site progress), "supply only" and "private customers"
answers, all four testimonials, "certificates available on request", and "access to our
warehouse and head office is by appointment only".
**DERIVED (needs client sign-off):**
- "Do you supply the whole of the UK?" — answered yes/UK & Ireland from their Distribution
  copy; their own accordion answer was never exposed.
- "Do you provide support systems and all ancillary items?" — answered yes from the
  product pages and testimonials.
- Lead times — deliberately **no number given** ("ask estimating for a date against your
  programme"); their site only claims "short lead-times".
- Warranty — deliberately **no term given** (points at the documentation). The homepage's
  "25-year finish warranty" claim is still unconfirmed, so it is not repeated here.
- The take-off schedule itself is **indicative** and captioned as such; the numbers are
  illustrative, the shape is real.

### Imagery
`public/assets/img/about/` — 5 soul_location webps, ~489 KB: ab-hero (racked extrusions,
1920), ab-rack (coated planks), ab-profile (cut plank ends, T&G in section), ab-pack
(dispatch bay, currently unused — held for a future section), ab-load (hiab offload).
Swap for the client's own factory photography when available.

### Wiring
About now points at `about.html` in the nav, mobile menu and footer of **all five pages**
(3 links each; previously `./#story`), `aria-current="page"` on this page, and a 6th vite
rollup input. `about.js` reuses the cases.js chrome verbatim (same convention) with only
the take-off block swapped in — 6.59 kB page JS.

Verified: every element AA or better, including hero type over photography measured
against the lightest composited pixel behind it (h1 9.8:1, lede 9.23:1, facts 7.13:1) and
the navy section (10.98 / 11.44:1); mobile stacks to one column with no horizontal scroll
and 85px FAQ taps; subpath build swept **15/15 resources, 0 failures**, schedule issuing
correctly on the built site.

---

## 2026-08-19 (final) — LISTING IS NOW JUST TABS + CARDS

**Read this before touching cases.html.** The listing went through three cuts and the
user rejected the first two. The current, approved design is deliberately plain:

  **Tabs on top (one axis: system) + a card grid below. That is the whole page.**

Do not reintroduce the earlier ideas — they were each tried and dropped:
1. *Pill bench + card grid* — rejected as templated.
2. *Elevation of full-width "courses"* (title block beside a facade slice, alternating
   sides, golden-ratio staggered splits, filter that "re-clads" the wall) — rejected:
   at ~250px tall every facade became a strip of texture, eight near-identical bands
   scanned like a spreadsheet, and the openable schemes had no prominence.
3. *Query sentence + two zones* ("Show me [any system] in [any finish]…" over large
   "open files" panels and a dense register table) — clever, and still rejected. The
   user asked plainly for tabs and cards.

### What is there now
- `.tabs` — four buttons: All schemes / VulcaLap&reg; / VulcaBar&reg; / VulcaFrame&trade;.
  Real `<button aria-pressed>` (no faked tabpanel contract); active state is a blue
  2px underline. **Each tab's count is derived from the cards in JS**, so it can never
  drift from the grid (08 / 05 / 02 / 01 today).
- `.cards-grid` / `.cc` — 3 columns desktop, 2 at 900, 1 at 640. Card = 3:2 facade,
  ref + status, name, location, a System/Finish/Completed ledger, and — only on the
  two with a full file — "View the case study". **Records are `<article>`, not links**
  (brief rule: only substantial projects get a case study), so there is no false
  affordance. The lit-top-lip hover is on `a.cc` only.
- Filter syncs to `?system=…`, so a filtered view is shareable and arriving on one
  lands on the right tab.
- ⚠️ `.cc[hidden]` and `.rt-row[hidden]` need `display: none !important` — `.cc` is
  `display:flex`, which beats the UA `[hidden]` rule. Same trap as the sample dialog.

### Hero: two columns, not one
The hero was a two-column grid with a single child, so the whole right half of the page
was empty (user flagged it). It is now title-left / lede-right, bottom-aligned on one
line, and the section is ~374px instead of a tall empty block.

### Still true from the redesign round (detail pages unchanged)
The project files keep their reflow and **the transformation** — hero → cover sheet →
01 brief (type only) → 02 constraint (oversized, navy) → 03 the answer = bottom-up
course wipe → 4 numbered plates → record → survey → specify → next file. The before
states were derived from their own afters via `nano_banana_2` image-to-image passing the
prior generation's **job_id** as `medias[].value`, which is why the wipe registers.

Verified on the built site under the subpath: tabs filter correctly (8→5→2→1→8), counts
derived, preset URLs land, 20/20 resources with **0 failures**, all card imagery loads,
mobile single-column with 52px tab taps and no horizontal scroll, no-JS drops the tabs
and stands all eight cards, and the detail pages are untouched and intact.

---

## 2026-08-19 — CASE STUDIES REDESIGNED: the wall, the sentence, the wipe

The first cut (below) was **structurally templated** — a pill-filter bar over a card
grid, and detail pages that alternated copy-left/image-right three times. The
"drawing register" idea lived in the COPY, not the STRUCTURE. Rebuilt so the idea is
enacted. **The sections below describe the superseded version; this one is current.**

### The register IS an elevation (`.reg-wall` / `.reg-course`)
The card grid is gone. Each scheme is now a full-width **course**: a solid title block
beside a slice of its facade, and the panel **trades sides down the wall** with
**golden-ratio staggered splits** (`--split`, 40–52%, written per course by the
builder) so the joints never line up — the contact wall's own bond. Verified in
browser: sides `lrlrlrlr`, splits 42.8/50.2/45.6/41.0/48.4/43.8/51.3/46.7, panel
`order` alternating 0/2. Hover chrome is compositor-only (a lit top lip via `scaleX`,
plus an image `scale`) — no height animation anywhere near a hover target.

### The filter is a SENTENCE, not 22 pills (`.reg-q`)
"Show me [any system] in [any finish] for [any sector], [any contract] in [any
region]." Each token is a real `<select>` styled down to an underlined inline token,
so the option list, keyboard, mobile picker and ARIA all come from the platform. The
sentence doubles as the readout, which deleted a whole UI row (the old
`SHOWING NN OF NN` strip); the count now sits under it. A token with a real choice
goes ink-on-blue (`.is-set`).
Applying a query **re-clads the wall**: courses sweep out toward their own panel side
and the rest close up under a Flip pass (`away()` keys off `data-side`). Reduced
motion skips it. Filter state still round-trips through the querystring.

### The project file's centrepiece: THE TRANSFORMATION (`.tx*`)
A **bottom-up course wipe** between the bare substrate and the finished elevation —
the divider is a lit course line, so it reads as cladding going ON, not as a slider
lying on its side. `--y` drives `clip-path: inset(calc(100% - var(--y)) 0 0 0)` on the
AFTER image, which sits over the BEFORE. It runs itself once on scroll-in, then the
reader owns it: the range input carries keyboard + ARIA, and on **fine pointers only**
the stage is draggable (a vertical drag on touch would fight page scroll).
⚠️ **CSS defaults to `--y: 100%` and the markup ships `value="1000"`** so a no-JS
reader gets the FINISHED building, not a building site. Verified: clip 100%→0%, the
line tracking 0→489px across a 491px stage, tags cross-fading 1/0 → 0.15/1.

### Detail-page flow, reflowed
hero → cover sheet → **01 the brief (type only, no picture)** → **02 the constraint
(oversized, navy, up to 5.6rem)** → **03 the answer = the transformation** → **the
plates (4 numbered, mixed spans)** → the record (ledger) → the survey → specify →
next file. The alternating ladder is gone; the first photograph the reader meets is
the one that argues.

### Imagery: aligned before/after pairs
The "before" states were **derived from their own "after" with `nano_banana_2`
image-to-image**, passing the prior generation's **job_id** as `medias[].value` — that
holds the camera, so the wipe reads as one building. Both pairs verified by eye:
window grid, balconies and roofline register across the divider. Knights =
substrate-to-clad (membrane, rails, brackets, scaffold); Merle = strip-and-reclad
(failed panels off, exposed concrete, cradles). `public/assets/img/cases/` is now
20 files / ~2.2 MB. Both pair members are exactly 16:9, so `object-fit: cover`
renders them identically even where intrinsic sizes differ (kh-before 1600x900 vs
kh-court 1920x1080) — **keep any replacement pair at the same aspect**.

### ⚠️ A CSS comment can break the stylesheet
The header comment contained `.cs*/.tx*` — the `*/` **closed the comment early** and
the rest of the header parsed as CSS (`Unexpected "*"`, `Unterminated string token`).
esbuild recovered, so the page looked fine, but the bundle carried garbage: fixing it
took the built CSS 17.34 kB → 16.56 kB. Never write a star followed by a slash inside
a CSS comment.

### ⚠️ Two verification traps hit again (both harness, neither a bug)
- **`window.gsap` is NOT exposed** (module import, same as ScrollTrigger). A probe
  doing `if (window.gsap) gsap.set('[data-reveal]', {opacity:1})` silently no-ops, so
  every `[data-reveal]` still reads `opacity: 0` and a contrast check on it returns
  **exactly 1.00** (the text composites into its own background). Set
  `el.style.opacity` directly before measuring contrast on revealed copy.
- **Transitioned properties read their OLD value** while the pane isn't compositing —
  the `.tx-tag` opacities looked frozen at 1/0. Strip `transition` then re-read.

Verified: filter matrix 5→2→1→0→8 with tokens/URL/empty state tracking, wipe exact
across its range, contrast AA on every new element (constraint copy 10.98:1 on navy,
captions 5.2–7.1:1), 40–43px taps, mobile stacks to one column with no side-trading,
no-JS hides the query and stands the full wall + finished elevations, subpath build
swept 20/20 resources with **0 failures** and preset-URL filtering working on the
built site.

---

## 2026-08-18 (evening) — CASE STUDIES BUILT: the register + two project files

Three new pages, per the client's item 5 (filterable case studies, tile → detail,
only substantial projects get a full study). The conceit extends the site's
documentation voice: **the listing is a drawing register** (every scheme a numbered
plate with a title block), **a full case study is the opened project file**, and
**filtering is a specification query** in the spec-bench voice.

- **`cases.html`** — the register. Query bench (5 axes: System / Finish / Sector /
  Contract / Region, radio-per-axis + All), live readout that composes the query back
  ("SHOWING 02 OF 08 — VULCABAR® · RECLADDING"), FLIP re-sort (gsap Flip, `absolute:
  true`), **filters sync to the querystring** so a filtered view is shareable — arriving
  on `?system=vulcabar&contract=recladding` lands pre-filtered with buttons pressed.
  Empty state converts ("make your scheme the first…"). 8 schemes: 2 full case studies
  (Merle tall plate, Knights wide plate) + 6 records — records are NOT links, per the
  brief. Contact-wall finale (id="enquire").
- **`case-knights-hill.html`** (VCS-033, new-build story, **cost DISCLOSED** variant £1.9m)
  and **`case-merle-court.html`** (VCS-041, occupied-tower recladding story, **cost NOT
  disclosed** variant) — the folder structure: full-bleed hero + cover-sheet title block
  (6 cells) → 01 The brief → 02 The constraint (navy band) → 03 The answer (plates beside
  chapters) → The record (LEDGER table, never stat tiles — the impeccable register bans
  hero-metrics) → The survey (drone slot: Knights = aerial still w/ slow CSS drift;
  Merle = the designed "footage pending" state, both states demonstrated) → Specify this
  build-up (as-specified sheet + mailto CTA firing `case_spec_request` dataLayer event,
  id="enquire") → next-file band linking the two files in a loop.
- **`src/cases.css` + `src/cases.js`** — one entry for all three pages; chrome duplicated
  from vulcalap.js per the project convention (wall block spliced byte-exact). QA hook
  `window.__reg = { state, apply, plates }`.
- **Vite**: 3 new rollup inputs. All asset URLs live in HTML (base-URL trap avoided by
  construction); subpath build swept clean — 21/21 resources, 0 failures, preset-URL
  filtering verified against the built site.
- **Nav**: the "Case Studies" item (all pages, nav/mobile/footer) now points at
  `cases.html` instead of the homepage carousel anchor; the homepage projects-head
  placeholder button is a real link. Burger breakpoint untouched (no link added).

### ⚠️ The legacy case images NEVER matched their captions — now they do
`case-knights.jpg` is a SILVER metallic tower (not cedar), `case-merle-court.jpg` is a
low curved-roof leisure building (not an 18-storey tower), `case-leamington.jpg` reads
cedar-orange (not anthracite). On a register whose title blocks assert system/finish per
plate, the pictures must corroborate the data, so:
- `case-knights.jpg` → **renamed `case-meridian-works.jpg`** (git mv) and now IS the
  Meridian Works "Anodised Silver" record + homepage carousel card (caption updated).
- Merle/Knights tiles + plates use NEW Higgsfield **soul_location** imagery
  (`public/assets/img/cases/`, 12 webps, ~1.4 MB total): mc-tower (3:4 tall plate),
  mc-podium (blue-hour hero, 1920), mc-corner, kh-court (hero 1920), kh-street,
  kh-reveal (cedar re-gen — first attempt came out ivory), kh-aerial (true top-down
  re-gen), reg-* records. `case-merle-court.jpg` is now UNUSED (left on disk).
- Leamington re-tagged Western Red Cedar; Elmwood re-tagged Dark Oak (what the images
  show); homepage carousel captions aligned. **SWAP ALL for client photography** — every
  page carries "indicative pending the client's content pass".
- Register/detail content (schemes, refs VCS-0xx, narratives, figures) is PLACEHOLDER
  in the documentation voice; brief hard-rule respected (remediation stories say WHAT
  was replaced/evidenced, never HOW certification is achieved).
- Builder scripts (`build_cases.py`, `build_files.py`, scratchpad) assemble the pages
  from vulcalap.html's chrome — the durable record is the pages themselves; edit them
  directly from here on.

Verified: filter matrix exact (5→2→1→0→1→8 with empty state at 0, aria-pressed exclusive,
URL round-trip), contrast AA on every new element measured (one finding: disabled clear
button 1.72:1 — WCAG-exempt, enabled state 6.64:1), 40px tap targets, mobile 1-col
(tall/wide spans collapse), no-JS = bench hidden + full register + native content intact,
no horizontal scroll anywhere, dataLayer event fires with scheme id.

---

## 2026-08-18 (later still) — CLIENT INSTALL VIDEO IS NOW IN 02 (`.iv*`)

`T-G-Buildup.mp4` is **no longer unused** — it ships as a chaptered player at the
bottom of 02 Engineered detail, so that section now carries the detail twice: drawn
above (the SVG section), built below. Took the recommendation recorded below: in 02,
**played not scrubbed**, one beat after the drawing.

- **Assets** (`public/assets/`): `video/tg150-install.webm` **2.01 MB** (VP9, listed
  FIRST so nearly everyone gets it) + `video/tg150-install.mp4` **3.17 MB** (h264
  fallback) + `img/tg150-install.webp` 75 KB poster. Page JS 29.4 → 34.2 kB.
- **Trim: 5.0s → 53.0s** (48.000s, 1200 frames). Measured, not guessed: frames 0-7 are
  pure white (Y=235 = full-range white), 8-22 are a fade, and the scene settles at
  frame 23 — but the supplied file ALSO holds a static title card
  ("VulcaLap T&G 150 - Installation Guide") until it clears at **4.8s**, and the tail
  is a frozen frame from **52.60s**. Cutting to 5.0s drops the white AND the title
  card and loses no install content. ⚠️ **The title card is a client asset — this is an
  editorial call, reversible by re-encoding from 0.92s** (that keeps the card and its
  ~4s of dead air).
- **CRF 28, deliberately**: CRF 24 was 6.2 MB, 28 is 3.24 MB, and at 2x zoom on the
  fixing close-up they are indistinguishable (PSNR 44.67 dB). It is a CAD render — flat
  faces compress hard. Do not "improve" it back to 24.
- **Chapters were read off the footage, not invented** — `data-t` on each button:
  0 membrane · 5.5 brackets & rails · 12 corner post & first course · **26 the concealed
  fixing** (the camera pushes IN at src 31s = t'26) · 43 clad (it pulls back at src 48s).
  Verified frame-by-frame; boundary flips land exactly on those values.
- **Never upscaled**: `.iv` is capped at **1280px**, the source's native width. At the
  section's full 1560 the render was blown up 1.22x (far worse at DPR 2). Measured
  after the cap: 1278 CSS px against a 1280 source = 0.999. Do not widen it.
- Controls sit **below** the picture, not over it: the render's ground plane is white
  and its membrane near-black, so an overlaid readout fights both inside one clip.
- The rail is a real `<input type="range">` (drag, arrow keys and ARIA for free); its
  thumb is a **playhead tick, not a round handle** — this site sets `border-radius: 0`
  on every control (the only circles on the page are the record plate's countersunk
  screws).
- Chapter progress is a compositor-only `scaleX(var(--f))`, never a width — five
  siblings would relayout every frame otherwise (same trap as the 05 coat swatches).

### Behaviour, and the two contrast bugs found in verification
Autoplays MUTED once at ≥50% visible, pauses when it leaves, resumes if it was the
SCROLL that paused it, and **stays paused if the user paused it**. Never loops (it opens
on bare sheathing and ends clad, so a loop would hard-cut to nothing); on `ended` the
overlay returns reading "Watch it again". No autoplay under reduced-motion or
Save-Data/2G. `controls` ships in the markup and JS removes it, so **no-JS keeps a
working native player** — the custom furniture is hidden by `html:not(.js)` rules
(mirrored in the `<noscript>` block; keep the two in step).

- ⚠️ **`--grey` (#bdbfbf) on white is 1.85:1.** The chapter numbers used it and failed
  badly at 11px. Now `--muted` = 7.14:1, with blue as the active tell. Don't put grey
  text on white anywhere on this page.
- ⚠️ `--muted` at **opacity 0.8** composites to **4.36:1** — just under AA for 12.5px.
  `.iv-note` AND the pre-existing `.pd-footnote` are now 0.9 (5.55:1).

### ⚠️ Verification traps hit here (all harness, none were real bugs)
1. **A non-compositing browser never delivers IntersectionObserver callbacks at all** —
   not just rAF. `rafRuns: 0` and a fresh IO gets zero callbacks in both the preview
   pane AND a background Chrome tab, so "autoplay didn't fire" is meaningless there.
   The autoplay decision is therefore factored out as `__iv.considerAutoplay(visible)`
   so the guards can be driven directly. The REAL observer was proved by loading
   `vulcalap.html#ivFig`: the fragment puts the component in view for the initial paint,
   and the page came back `started:true, currentTime:10.85, autoPaused:true` with no
   user gesture — autoplay AND auto-pause, end to end.
2. **CSS transitions don't progress either**, so a transitioned property reads its OLD
   value forever. `.iv-play` read `opacity: 1` while `pointer-events` from the SAME rule
   read `none`. To read the target, set `style.transition='none'`, flush, then read.
3. **Preview-pane screenshots are STALE composites** — they returned frames from an
   earlier scroll position that contradicted the measured layout. Do not trust a
   screenshot from a pane that is not displayed; measure numerically.
4. **A stale `python -m http.server` from an old session was still bound to :8123**,
   serving an OLD dist — so the new assets 404'd and the subpath check looked broken.
   The served `vulcalap.html` was 97,189 bytes against 101,637 built. Check
   `curl -s .../vulcalap.html | grep -c ivFig` before believing a 404, and use a fresh
   port. On :8137 the subpath run was 153 resources, **0 failures**.

**QA hook:** `window.__iv = { paint, video, marks, considerAutoplay, state(), setMayAutoplay(b) }`.
rAF is dead in the pane, so call `__iv.paint()` after setting `currentTime`.

**Open:** client sign-off on dropping their title card; swap for real site footage if the
shoot ever supersedes the CAD.

---

## 2026-08-18 (later) — HERO REPLACED: scroll-scrubbed frame sequence

The procedural 3D hero was swapped for a **scroll-scrubbed frame sequence** generated
from Vulcan's OWN build-up render. `src/buildup.js` deliberately exports the SAME
`{ apply(p) }` contract as `initFacade()`, so reverting is one import in vulcalap.js.
**facade.js is NOT dead code — it is the fallback. Do not delete it.**

- **Source**: `Vulcan-H-1.webp` (591x710) off the live VulcaLap page, upscaled to
  2160x2592, then Higgsfield **Seedance 2.0** image-to-video.
- **Frames**: `public/assets/img/buildup/f001..f121.webp`, 820x1028, **4.2 MB total**
  (12fps sampled out of a 10s clip — 121 frames is plenty because scrubbing is slow).
- **Bundle win**: facade.js was the only Three.js importer on this page, so dropping it
  removed **~500 kB** (`RoomEnvironment`) from the VulcaLap bundle; page JS 32.9 -> 29.4 kB.

### Generation notes (if the clip is ever regenerated)
Four clips were generated from IDENTICAL prompts/settings; the results varied a lot, so
**variant count is the real lever — generate 2+ and pick**. Two failed the same way:
planks ended up FLOATING unattached with courses misaligned. The keeper starts on bare
substructure and clads bottom-up to a complete wall with a section cut down the right edge.
Camera is genuinely locked (object bbox height constant to +/-1px across all frames).

⚠️ Seedance coerces `start_image` into `reference_images` (visible in the echoed params).
It therefore re-renders the scene in its own 3D space rather than animating your image:
frame 0 does NOT match the source. That is WHY the camera is so stable — but it also means
**the geometry is an AI reinterpretation, not Vulcan's certified detail**, and the red
Tenmat cavity barriers are visible in the early frames. Flagged to the user; client sign-off
is the open question, not a technical one.

### Composition is SCROLL-DRIVEN (added after first review)
The first cut pinned the stage right for the whole scroll, so once the copy faded at
~p0.18 the entire left half was dead space, and the callouts sat ON the artwork where
they were hard to read. Both are fixed in `paint()`:

- **The stage glides.** `place = seg(p, 0.06, 0.32)` drives BOTH position and scale off
  one eased value (they can never disagree): at rest it sits right at pad 0.80 leaving the
  headline its column; by p~0.32 it is centred at pad 0.92. Verified: centre 1092 -> 712
  against a canvas centre of 713, gap at rest cut from ~440px to 221px.
- **The right inset is what clears the progress rail** (`.phero-rail` at x1371-1389).
  Artwork right edge stays at 1341. Do not remove the `w * 0.05` inset.
- **Callouts moved into the margins** with elbowed leader lines STROKED ON THE CANVAS
  (exact against the artwork, and it suits a technical drawing better than a floating
  bubble). `ANCHORS[].side` sends each box out; co-active labels always take OPPOSITE
  sides so they cannot collide. `.at-edge` drops the label's own stub since the canvas
  leader already reaches it. Below `MARGIN_MIN` (132px) it falls back to sitting on the
  artwork, which is what mobile does.
- Label opacities are computed BEFORE `paint()` because paint draws the leaders and has
  to know which are live.
- ⚠️ The bbox-scan verification trick now also picks up the leader lines, so a measured
  "artwork edge" is really the leader tip. Do not read it as an overlap.

### Wide-screen whitespace fix (round 3 of the composition)
At 1900px the at-rest stage left a ~558px void beside the headline. Three causes, all in
`paint()` / its helpers now:
1. Right-aligning to the VIEWPORT ignored the page container — the stage also jutted past
   where every other element stops. It now aligns to the container via the copy's resolved
   `padding-left` (⚠️ `--gutter` itself is NOT readable via getPropertyValue — calc string).
2. The frames carry UNEVEN baked-in paper padding, so centring the draw rect does not
   centre the INK — `measureInset()` scans frame 1 once and placement uses ink bounds.
3. The stage is centred in the column between the real TEXT edge (widest copy child, not
   the fixed-width copy box) and the container edge; `MIN_GAP` is a clamp, not an offset.
And at squarer viewports (1100x800) the viewport-scale ink was WIDER than that column —
the right clamp shoved it 15px under the headline. The scale now also respects the column
(`sCol`), dissolving as the copy leaves. Verified balanced at 1900 (140/129), 1440 (84/99),
1100 (41px clear), still deterministic, still clears the rail.
### 01 Overview is now a NAVY BAND (2026-08-18, user call)
`.po-intro` got `background: var(--navy)` + `.statement-text { color: var(--white) }`,
and symmetric vertical padding so it reads as a band rather than a top-heavy slab.
Page rhythm is now paper -> NAVY -> white(02) -> NAVY(03) -> NAVY(04) -> paper -> paper
-> NAVY(finale), i.e. an early colour commitment straight off the hero.

Nothing in JS changed — the word-reveal still animates `.w` opacity 0.14 -> 1, which on
navy is the same "unread" wash inverted. Verified: revealed white on navy = **15.56:1**;
unread state composites to rgb(39,68,88) = 1.52:1, which is intentional and only ever a
transient scroll state.

⚠️ Two verification traps hit here, both of which look like bugs and are not:
- `window.ScrollTrigger` is NOT exposed globally (module import), so `getAll()` returns
  0 triggers. Check for a GSAP-written inline style on a `.w` span instead.
- Toggling `html.reduced` by hand on an already-animated page reads 0.14, because GSAP's
  INLINE opacity beats the `html.js.reduced .statement-text .w { opacity: 1 }` rule. In a
  real reduced-motion load the tween is never created (`if (!reduce)`), so no inline style
  exists and the rule wins. To simulate, strip the inline styles first — done, reads 1.

### USP ticker REMOVED from this page (2026-08-18, user call)
The navy marquee under the hero duplicated every claim verbatim — hero facts strip
carries A2-s1,d0 / secret fixed / TG125 & T&G150, the strap has "made in Britain", and
the 01 statement repeats A2-s1,d0 again — so the claim appeared 3x in ~1.5 viewports,
and it broke the "Every layer, accounted for." -> statement handoff. The HOMEPAGE ticker
stays (range-level, different context). The .marquee CSS lives in shared styles.css and
is untouched; restoring here is pasting the div back above #overview.

### Audit fixes 2026-08-18 (P1/P2 round after the impeccable audit — score was 17/20)
- Canvas aria-label was still "Interactive 3D model..." from the facade era → now
  `role="img"` + an honest description of the cladding animation.
- **No-JS**: a `<noscript>` block in vulcalap.html mirrors the `html.reduced` hero layout
  and ALSO hides the never-painted canvas. ⚠️ Keep it in step with the reduced rules in
  vulcalap.css if those change.
- **Frame loading is now tiered** (buildup.js `boot()`): reduced-motion fetches ONLY the
  final frame (~35 KB instead of 4.2 MB); Save-Data / 2G fetches every 4th frame + last
  (~1.1 MB); `nearestLoaded()` paints the closest available frame (earlier neighbour wins
  the tie) so sparse or in-flight sets scrub coarsely instead of blanking. The reduce and
  lite branches are code-reviewed but NOT device-tested — no way to emulate the media
  query or navigator.connection in this harness.
- **Tap targets** (styles.css, SHARED with the homepage — verified no layout shift on
  either page: rail still 38, nav still 76): `.util-soc` 30→38px box (glyph unchanged),
  `.util-link` +10px vertical padding, `.nav-links a` +18px vertical padding (also
  bridges the hover gap to the Products dropdown).
Remaining from the audit, deliberately NOT done (P3/scope): em-dash trim in client copy
review; hint copy "the system opens"→cladding phrasing; noindex removal at production.
### Two real bugs found here — do not reintroduce
1. **`img.decode()` NEVER SETTLES in a hidden document** — it neither resolves nor rejects,
   so a `.then/.catch` fallback never fires. The loader originally awaited it, which meant a
   BACKGROUND TAB (cmd-click, "open in new tab") left the hero permanently blank. Resolve on
   `onload` (which does fire when hidden, verified) and fire `decode()` unawaited purely to
   warm the decoder. Whichever settles first wins.
2. **Label handover** — the four `.plabel` callouts had overlapping in/out windows, putting
   three on screen at once mid-scroll. The two pairs must HAND OVER with a gap (verified:
   max 2 on at any progress, zero at p=0.50).

### Verification (all in-browser, pane never composited)
A 2D canvas is `getImageData`-readable, so the hero is checkable without screenshots — a real
advantage over the WebGL version. Confirmed: 11/11 sample points paint distinct frames; three
consecutive full sweeps byte-identical (deterministic AND reversible, the whole reason for
frames over `video.currentTime`); canvas corner exactly `#f4f7fa`; artwork x774-1202 vs copy
ending at 708 (no collision); portrait centred + bottom-anchored.
**Determinism is false on the FIRST sweep only** — first-paint decode lag in a hidden
document. Warm up with one sweep before asserting, or you will chase a non-bug.

### Backdrop
Frames are pre-blended from pure white into `--paper` (#f4f7fa) by `paperise.py` (scratchpad):
a soft luminance ramp 243->252 gated on low saturation. No alpha key needed — paper is within
~11/255 of white so there is no halo to fight, and the saturation gate protects the red barrier
and green sheathing-edge highlights. Corners verified at exactly 244,247,250.

---

## 2026-08-18 session — VulcaLap product page (first inner page) BUILT

New page at **/vulcalap.html** (Vite multi-page: `vite.config.js` now has rollupOptions.input
for both pages; `npm run build` emits both, base path verified). Files:

- **`vulcalap.html`** — full page: shared nav/footer chrome (logo symbols spliced byte-exact
  from index.html), product rail sub-nav (`.pnav`, scrollspy, rides to top when the main nav
  hides via `body.nav-up`), 3D system hero, 01 Overview (statement + split +
  index ledger), 02 Engineered detail (scroll-traced SVG section drawing of the T&G150 joint),
  03 Performance (navy ledger, 5 rows), 04 Applications (3 full-bleed panels), 05 Finishes
  (3D configurator), 06 Technical (spec accordion + NBS copy + request-based downloads),
  finale = the same "facade answers" contact wall, footer. **No eyebrows on this page**
  (explicit user rule for inner pages, despite the homepage's client-requested SEO eyebrows).
### SAMPLE REQUEST DIALOG (new)
Native `<dialog>` in `.rq*` — modal is earned (the task needs protected focus), and it
gives focus trapping, Esc, inert background and `::backdrop` for free.

**Fields mirror Vulcan's LIVE Gravity Form (#9) on the current VulcaLap page**, scraped
rather than invented, including which ones they mark required:
samples (Shiplap/T&G x WOOD/RAL) · name · phone* · email* · company · project reference* ·
address (street/town/county/postcode, country fixed to United Kingdom)* ·
project type* (Residential/Commercial/Other + specify) · project size* (20-50 / 50-100 /
100-200 / 200-500 / 500m2+) · start date* · where did you hear about us (Google Search /
Google Advert / Colleague-Friend Referral / Social Media / Other + specify) ·
further information.

Split into TWO STEPS on purpose: 14 fields in one modal kills conversion, and the brief
needs name + contact number reaching Pipedrive. Step 1 is the lead (samples, name, phone,
email) and fires a `sample_request_lead` dataLayer event ON ADVANCE, so a drop-off on
step 2 is still a captured lead. Step 2 is the project detail.
The samples field PRE-FILLS from the page: the spec bench profile (TG125/T&G150 -> T&G,
otherwise Shiplap) and finish family (RAL vs WOOD).

**BACKEND PENDING:** set `RQ_ENDPOINT` in vulcalap.js to the Pipedrive-backed handler and
it POSTs JSON; while it is null the enquiry is composed as a mailto so nothing is lost.
Both paths end on the same success panel.

Triggers: every "request a sample" CTA carries `data-enquire` (hero, product rail, mobile
menu, finale). The nav "Start a conversation" still just scrolls to the finale.

**Three gotchas that bit here — keep the structure as it is:**
1. `[hidden]` loses to an explicit `display` — `.btn` is `inline-flex` and `.rq-done` is
   `grid`, so the success panel and BOTH footer buttons rendered at once. Fixed with
   `.rq [hidden] { display: none !important }`. Also restate `margin: auto`; the UA
   centring was not surviving.
2. **Scrolling was dead.** The UA gives `dialog` `overflow:auto`, so the dialog AND the
   inner form were both scroll containers, fighting each other, and the sticky footer
   sat over the fields. The dialog is now `overflow:hidden`; the panel is a flex column
   at `max-height:min(90dvh,56rem)`; a dedicated `.rq-scroll` holds the steps with
   `flex:1 1 auto; min-height:0; overflow-y:auto` — **`min-height:0` is mandatory**, a
   flex item will not shrink below its content without it and nothing scrolls. The
   footer is a normal `flex:none` sibling AFTER the scroller, so it can never overlap.
3. **Scrolling was dead AGAIN, for a second and unrelated reason (2026-08-18).** The
   CSS above is correct and `.rq-scroll` really is a scroller — but opening the dialog
   calls `lenis.stop()`, and a STOPPED Lenis runs `event.preventDefault()` on every
   wheel event on the page, so the inner scroller got no wheel either. Lenis tests for
   `data-lenis-prevent` in the composedPath *before* it reaches its `isStopped` branch,
   so the attribute on `.rq-scroll` is the fix and `lenis.stop()` must STAY (it is what
   keeps the background frozen). Verified by dispatching a cancelable wheel inside the
   scroller and reading `defaultPrevented`: true before, false after; background wheel
   still true. Note a synthetic wheel is untrusted and will NOT move `scrollTop` even
   when correct — assert on `defaultPrevented`, not on scroll position, or you will
   wrongly conclude the fix failed. (`allowNestedScroll: true` on the Lenis constructor
   would fix this globally for all future nested scrollers; chose the per-element
   attribute deliberately.)
4. Fields on a row stretched to the row height, so inputs ended up different heights and
   off each other's baseline. `.rq-field { align-content: start }` +
   `.rq-row { align-items: start }` + a fixed input height.

### 06 REBUILT as "THE SPEC BENCH" — and the page IA was resolved
06 was three unrelated jobs in one section (NBS box + a mailto document list + a
5-group accordion) AND it duplicated 03: after 03 became the record plate, the page had
TWO different document-request mechanisms. That duplication was the real cause of the
"confusing" feel. Resolved with the user:

  **03 owns EVIDENCE** (proof it performs: classification report, datasheet, warranty,
  EPD, installation detail) — the record plate.
  **06 owns SPECIFICATION** (what you draw and what you write).
  Do NOT reintroduce a document-request list in 06.

06 is now a live configurator, in `.sb*` — deliberately NOT a fourth pinned experience
(the page already has three); it is the page's one Operate surface, a dense tool.
Three choices (profile / orientation / finish system) drive an NBS clause that rewrites
itself, and every line that actually changed FLASHES like a diff — that is the whole
tell that the document is live. Derived figures (cover, rail centres, cavity, reaction
to fire) update alongside in tabular numerals. Two actions only: copy the clause, or
have the drawing files issued against exactly that specification (both carry the live
config into the mailto + a dataLayer event).

Real spec logic, not decoration: choosing **vertical** flips the support line to
"Horizontal cladding rails at 600mm c/c"; choosing **anodised** flips the fire line to
A1 and the finish line to non-combustible.

All the old accordion's product truth survives — in the clause, the data strip, or in
05 (finishes range) and 03 (fire evidence). Nothing was dropped.

Radio inputs are real `<input type="radio">` behind labels, so keyboard arrow-key
navigation and screen-reader semantics come for free.

**Detector pass (impeccable v4.1.1) also caught a genuine defect elsewhere:** the coat
swatch rail in 05 animated `height`, re-laying out all 15 siblings on every hover and
sliding the hit target out from under the cursor. It now animates a registered
`@property --h` driving a compositor-only `scaleY` on a `::before`, with the button
height constant. Do not put `transition: height` back on `.coat-sw`.

### 03 REBUILT as "THE RECORD PLATE"
The navy stat ledger was exactly the pattern the impeccable brand register bans
("hero-metric template: big number, small label, supporting stats") — five identical
figure+label+sub rows. Section 03 is now a physical object, in `.rec*`:

A machined **aluminium record plate** on the navy (CSS brushed-metal: raking sheen +
fine horizontal grain + inner bevel + hard shadow, four countersunk corner fixings, an
etched header strip). The five claims are ENGRAVED into it — dark cut face with a light
lower lip — and scroll runs a **cutting pass** that files each line in left-to-right
with a hot tool point at the cut edge. "Performance you can file", in both senses.

Then it does real work: each line names the DOCUMENT that evidences the claim, clicking
strikes a tick into the metal and adds it to the pack, a counter + meter track the
selection, and the CTA composes a mailto with the chosen documents and pushes an
`evidence_pack_request` dataLayer event. That turns the section from a stat wall into
the page's second conversion point (wire to Pipedrive at dev stage).

**Key implementation notes:**
- The lines are engraved by DEFAULT (`--cut: 0%` in CSS); JS sets 100% and scrubs back
  to 0 only when motion is allowed. Never gate the content on the animation — no-JS and
  reduced-motion both ship a complete, readable plate.
- Contrast on the plate is deliberate and verified in-browser against the plate's
  DARKEST tone (#a9b0b7): figures/claims #232b33 = 6.54:1, secondary #333c45 = 5.12:1.
  Do not lighten the engraved text "for realism" — engraving looks low-contrast in life
  but must not be low-contrast here.
- Plate tilt is a `transformPerspective` + rotationX/Y quickTo on fine pointers only.

### 04 REBUILT AGAIN (v3, FINAL) — full-bleed applications, re-clad course by course
The descent/survey-staff version (v2, below) was rejected as CONFUSING — it ran three
systems at once (an abstract cladding staff, a continuous storey counter, and discrete
application labels) and the staff needed explaining. v3 keeps ONE idea:

Four full-bleed photographs, one per application, pinned at 360%. Moving between them
**re-clads the frame course by course**: the incoming photo arrives as 14 horizontal
bands sweeping in from alternating sides, with a bright leading edge on each — the way
the system actually goes up. The application name is the hero type (the section title
drops to a small label); the 4-item index along the bottom doubles as the progress bar
and jumps you straight to any application. Everything derives from one scrub value.

**Band composition technique:** each band is a window (`overflow:hidden`, height
`100%/--bands`) onto an `<img>` sized `height: calc(100% * var(--bands))` and pushed up
`calc(var(--j) * -100%)`, so `object-fit:cover` still governs the whole picture and the
bands compose ONE undistorted photograph. Do not switch this to per-band
`background-position` — that forces a stretch when the stage aspect != image aspect.

**NEW IMAGERY** (`public/assets/img/apps/`, 4 x 1920x1080 webp, ~635 KB total):
generated with Higgsfield **soul_location** (16:9) for this section —
`app-highrise` / `app-overclad` / `app-soffit` / `app-commercial`. All four deliberately
share one material language (warm timber-effect horizontal plank courses, fine dark
shadow gaps, no visible fixings) so the section argues "same plank everywhere" through
the pictures themselves. Prompts are in the session transcript; regenerate with
soul_location if the client wants variants. SWAP FOR THE CLIENT'S OWN PHOTOGRAPHY when
the shoot happens.

**Bugs fixed here:** `max-width: 20ch` on the display heading resolved against the BODY
font-size (crushing it to ~170px) — use vw/px for display type. And `--bands` must not
be overridden per breakpoint: the band elements are built once in JS from that value,
so a mismatch after a resize breaks the composition.

### 04 v2 (SUPERSEDED) — the measured descent
The three stacked full-bleed panels were rejected as generic. Section 04 is now ONE
pinned viewport, 300% scroll, in `.app*`: you DESCEND a facade from the eighteenth
storey to the underside of a fascia, which is the section's own copy made literal.
Three viewport-tall scenes travel upward in one column (each photo also drifts inside
its own band, so the facade has depth), and the joins are treated as slab edges.
A **survey staff of real VulcaLap cladding** (tile-cedar.webp, the same material as 05)
is held against the building, graduated in storeys, and is the one thing that never
changes as the architecture behind it does — that IS the argument: "the same plank,
the same classification, the same shadow line". A fixed datum line reads the storey
off it and the number counts 18 -> 00 continuously.
Images: only `case-knights`, `case-leamington` and `case-merle-court` are high enough
resolution for full-bleed (1788x1200 / 1788x1200 / 1200x2150). The other case shots are
480x358 and would visibly soften — do not promote them to full-bleed without new files.

**Bugs found and fixed here — do not reintroduce:**
1. `getComputedStyle().getPropertyValue('--gap')` returns the literal `clamp(...)`
   string, so `parseFloat` gives NaN. The storey pitch is derived from real layout
   (`staff.offsetHeight / 31`) instead.
2. The staff had `overflow:hidden`, which clipped its own storey numbers (they sit
   outside its box). The pin already clips vertically, so the staff must not.
3. The staff run needs 6 storeys of material above and below the graduated range or
   it does not fill the viewport at the ends of the scroll.
4. Label swaps used a gsap timeline with a deferred `.add()` callback. Scrolling fast
   killed the timeline before the callback ran, stranding the copy on the wrong
   application at opacity 0. Content is now set SYNCHRONOUSLY and only the entrance
   is animated.

Note for future verification: in the Browser pane, rAF is suspended while the pane is
not compositing, so in-flight tweens freeze and `style.opacity` reads 0. Force a
screenshot before trusting an animated value — it is a harness artifact, not a bug.

### 05 REBUILT AGAIN as "THE COAT" — a pinned dip-coat narrative (final)
The coat-index layout was rejected (too sparse / too conventional). Section 05 is now
ONE pinned full-viewport composition, 420% scroll, in `.coat*`:
the whole stage IS the surface — a wall of the real coated material (tile-*.webp,
repeated at cladding scale + course lines) with the cut-out product panel in front.
Scroll pours coat after coat DOWN the stage: **one hard edge crosses wall, panel and
headline together**, then the wall splits into all 14 coats as vertical bands, then
resolves into a finished building with "Same extrusion. Any elevation you draw."
Opening state is the UNCLAD building (navy, no tile) with a bare mill-finish panel.
The rail along the bottom is the whole range as a spectrum; hover/tap pours that coat
over the stage and holds it, and a real scroll hands control back to the narrative.

**EDGE KEYING — the panels were RE-CUT (2026-08-18), do not regress this.**
The first cutout flood-filled the white backdrop to a BINARY alpha and then blurred it.
Blurring re-exposed the render's own anti-aliased ring, whose RGB is a blend of the
product WITH the white backdrop — so every panel carried a pale halo. Eroding the mask
is not the answer either: it thins the bracket arms, and the contaminated ring is WIDER
on pale coats (a light plank against white is a low-contrast edge, so the render's AA
spreads further — cedar/chestnut/ivory were the worst).
The fix keeps the silhouette and rebuilds the COLOUR: flood-fill the backdrop, mark the
2px ring of object pixels it bled into as untrustworthy, then grow the interior colour
over the ring and on outward into the backdrop, and only then feather the alpha ~0.5px.
Measured white pixels on the anti-aliased rim went from 9-13% to 0-1.6% (ivory's
remaining 6.86% is 142 SCATTERED pixels — real specular highlights on the plank's top
lip, verified by marking them, not a halo).
Script: scratchpad `recut.py` — re-run it, not the original `mkassets.py` cutout, if the
panels are ever regenerated.

**Assets** (`public/assets/img/finishes/`, ~434 KB total): the client's own renders
`fin-*.webp` (500x650, pure white bg) -> `panel-*.webp` (border flood-fill alpha key,
0.6px feather) + `tile-*.webp` (300x210 patch of flat plank FACE). `panel-raw`/`tile-raw`
= mill-finish aluminium derived from **fin-anthracite** so the narrative pours keep the
SAME shiplap-horizontal geometry (only the coat changes). Generator scripts were run from
the scratchpad; regenerate with the recipe in this file if the client supplies new renders.

**Three real bugs found and fixed in verification — do not reintroduce:**
1. `clip-path` percentages resolve against **each element's own box**, so the panel and
   headline cut at their own mid-points, not the wall's line. Panel + copy cuts are now
   set in absolute px from JS (`cutAt()`, measured against the pin).
2. The two copy layers are transparent text, so both rendered at once and the readouts
   superimposed. The base copy needs the **complementary** clip (`side:'below'`). The
   wall and panel don't — they are opaque images that simply cover what's behind.
3. The rail pick was cancelled instantly because a scrub tween settling fires onUpdate.
   The override now clears only on a genuine scroll delta (>0.004), and `killTweensOf`
   runs on the OLD object before the new one is created.

### Finishes section REBUILT as "the coat index" (same session, later round)
The 3D finish configurator was replaced at the user's request with the client's REAL range
renders scraped from vulcansystems.co.uk (14 slider images, 500x650 webp, pure-white bg,
saved to `public/assets/img/finishes/fin-*.webp`, ~150 KB total). New component (`.pfin`,
white stage): giant outlined ghost name behind one large panel render; the range as a
grouped editorial type-flow index (Wood-effect x9 / Anodised x1 / Any RAL x4) — hovering a
name re-coats the panel live (crossfade + ghost rise), tap/click commits, dragging the
panel flips through the range (90px per step, wraps), arrow keys work when focused; meta
ledger = counter + finish name + profile/orientation (renders mix Shiplap / T&G125 /
T&G150, H and V) + coat note. `initFinishStage` in facade.js is now UNUSED (kept, dead).
FIN_LIB data map lives in vulcalap.js.

- **`src/facade.js`** — the 3D module. `initFacade()`: procedural VulcaLap rainscreen build-up
  (8 T&G courses + seam strips, rails at 600 centres, membrane/insulation/sheathing/substrate)
  that EXPLODES on scroll — everything driven by one `apply(p)` (p 0..1) so resize never
  desyncs; camera fit recomputed per aspect (portrait vs landscape composition). One course
  draws out of the bond along its length; projected DOM callouts (`.plabel`) track anchors.
  `initFinishStage()`: 5-course rake, per-course cloned materials, real-time coat swap
  (cedar/oak/anthracite/anodised silver/RAL) with light response. Wood grain = procedural
  CanvasTexture (no image assets). Swap for client CAD/GLTF when supplied.
- **`src/vulcalap.js`** — page entry. Chrome deliberately DUPLICATED from main.js (nav,
  menu, dropdowns, reveals, magnetic, wall finale, NBS copy, clock) so the verified homepage
  bundle stays untouched. Hero pin: ScrollTrigger 340%, scrub 0.55, proxy tween → apply(p).
- **`src/vulcalap.css`** — page styles, loads after styles.css, all page-scoped prefixes.

Homepage edits (3 links only): nav dropdown VulcaLap, systems-panel "View system" CTA
(button→anchor), footer Systems VulcaLap → `vulcalap.html`.

**Gotchas found this session:**
- Portrait camera fit exceeded the camera FAR plane (wall vanished on mobile) — far is now
  2500; portrait composition pushes the wall to the top third (lookAt ty −100→0).
- Seam shadow strips must sit PROUD of the plank face (z 0.76, 0.08 deep) — flush strips
  z-fight into dashed lines.
- Browser-pane screenshots letterbox (pane physical size ≠ logical viewport): composition
  reads left/high in captures — verify positions numerically, not by eye.
- QA hooks: `window.__facade.apply(p)` renders the hero at any progress synchronously
  (readPixels-able); `window.__finish.setFinish(key)` for the configurator.

**Open on this page:** real NBS clause (still DRAFT map), real downloads files, real CAD
model swap, Pipedrive capture on the CTAs, client copy review. Dims in the section drawing
are marked indicative. VulcaBar / VulcaFrame pages not started.

---

## 🔴 BUILD-TIME TRAP — read before building VulcaBar / VulcaFrame

**Any asset URL built in JS MUST use `import.meta.env.BASE_URL`.**
Vite rewrites absolute `/assets/...` paths in HTML and CSS at build time, but it
CANNOT rewrite a string literal inside JS. So a hardcoded `/assets/img/x.webp`
works perfectly in dev (base `/`) and 404s on the GitHub Pages project subpath
`/vulcan-cladding-systems/`.

This SHIPPED BROKEN on 2026-08-18 (commit 2771e52, fixed in 80b4c81): `wbSrc`,
`tileUrl` and `panelUrl` in vulcalap.js took out every image in 04 Applications
and the entire 05 coat wall + panel on the live site, while everything looked
perfect locally. The homepage was never affected because its paths are in HTML/CSS.

```js
// WRONG — 404s in production
const u = (k) => `/assets/img/finishes/tile-${k}.webp`;
// RIGHT
const u = (k) => `${import.meta.env.BASE_URL}assets/img/finishes/tile-${k}.webp`;
```

**Verifying this needs the production build served under the SUBPATH.** Serving
`dist` at localhost root proves nothing — the bug is invisible there by construction:
```bash
npm run build && mkdir -p /tmp/s && cp -r dist /tmp/s/vulcan-cladding-systems
cd /tmp/s && python -m http.server 8123
# then load http://localhost:8123/vulcan-cladding-systems/vulcalap.html and
# check performance.getEntriesByType('resource') for responseStatus >= 400
```

## Coat wall textures REBUILT (2026-08-18) — tile-*.webp are new
The old tiles were 300px crops from the ISOMETRIC render, so their plank seams and
wood grain ran DIAGONALLY (fighting the horizontal course-line layer) and were
upscaled 2.8x on retina — the "pixelated" complaint. Now:
- two client renders (fin-cedar, fin-bronze) upscaled 6.3x via Higgsfield (4 credits),
- de-rotated by the measured **28.4 deg** plank angle so grain runs horizontal,
- cropped to exactly ONE course pitch (**505px**, measured off the specular course
  lines) with that line CENTRED so both tile edges land in flat face,
- offset-blended both axes -> seams measure at or below the interior gradient,
- recoloured to all 14 coats from each coat's OWN sampled colour (validated against
  the existing `COATS[].lum` values: cedar 143.3 vs 144, ivory 183.7 vs 183).
Assets 434 KB -> 170 KB, and the tile is now DOWNSCALED 0.5x at DPR 2.
⚠️ Because the tile is one course, `background-size` had to be retuned
(420px -> `clamp(110px, 9vw, 175px)`); course now reads ~118px not ~381px.
Scripts are in the session scratchpad; the recipe above is the durable record.
⚠️ A faint diagonal ghost remains in the wood base (render lighting). Subtle, behind
the veil, but visible if you look.

## ~~Client video supplied, NOT yet used~~ — SHIPPED, see the 02 install-film section above: `T-G-Buildup.mp4`
User's Downloads, 2026-08-18. Vulcan's REAL CAD install animation — 1280x720, 25fps,
54s, no audio, 6.7 MB (re-encodes to 3.1 MB h264 / 1.6 MB VP9 at 720p).
Arc: membrane roll -> substructure -> planks bottom-up round a corner -> close-up on
the concealed fixing -> clad. Real geometry, not an AI reinterpretation.
**Recommendation given — and TAKEN on 2026-08-18: put it in 02 "The joint does the work"**
(same subject as that section's SVG joint drawing), NOT the hero — it is 16:9 in a dark OSB environment vs
the hero's portrait paper stage, its camera moves constantly (scrubbing a moving camera
needs ~300+ frames = 8-12 MB, worse than the current 4.2 MB), and it opens on a membrane
roll. **PLAY it, do not scrub it.** Gotchas: frame 0 is ~0.9s of PURE WHITE (RGB 255,
std 0.0) and must be trimmed; it does NOT loop (starts membrane, ends clad) so play once
on scroll-into-view. Awaiting the user's decision.

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
- **ffmpeg/ffprobe ARE on PATH now** (winget Gyan.FFmpeg 9.0) — just call `ffmpeg`.
  The old scratchpad-hunt note is dead. ⚠️ `bc` is NOT available in this bash; use
  `$((...))` or python for arithmetic. ⚠️ ffprobe's `-read_intervals` does nothing on a
  `lavfi movie=` source, and `pkt_pts_time` prints empty in v9 — dump the whole series
  and index by frame number instead.
- Image gen: Higgsfield MCP `generate_image`, model `nano_banana_pro` (server maps to
  nano_banana_2, defaults 1k — fine for small assets; pass `resolution: "2k"` for hero-size).
- Deploys: 30s–8min, sequential per push; watch with a background
  `until gh run list … completed …` loop and auto `gh run rerun <id> --failed` — the
  transient "Deployment failed, try again later" clears on rerun (sometimes needs two).

---

## Copy & SEO pass — 2026-07-14 (per Vendo change schedule: `Vulcan_Cladding_Copy_SEO_Change_Schedule.md`)

Applied the copywriter/SEO change schedule (Alfie Wakelin, Vendo) across `index.html` + a little
CSS/JS. Three forks were decided by the user before building:
- **No section eyebrows** (C4 declined). SEO keyword coverage instead comes from C5 H3 descriptor
  sublines (`.hpan-h3sub`) + JSON-LD. Do NOT reintroduce eyebrows.
- **A2 classification string IS published** (E2 approved by user, *pending Ray's sign-off*): the fire
  section now says "classified A2-s1,d0 to BS EN 13501-1 as tested". Reversible to a string-free
  fallback if Ray declines.
- **VulcaFrame ® → ™ site-wide** (E3): it is not in the footer's registered-marks line, so ® was a
  legal exposure. All `VulcaFrame<sup>&trade;</sup>` now.

**Done:** A1 hero sub-line · A3 "standard you specified" · A4 plank "No core, no laminate" + hidden-
fixings `.plank-note` · **A5 fire section** (H2 "The fire evidence is already written.", A2-s1,d0
lede, cert grid split to 2 chips — ISO moved out) · A6 `.finish-creds` (Qualicoat · 25-yr warranty)
· A7 contact CTA "A system for every elevation" + button "Request samples and specs" (nav keeps
"Start a conversation") · A8 Croydon removed from body copy (only the footer postal address + clock
remain, both permitted NAP) · **Section B** steps→advantage: H2 "Where Vulcan pulls ahead.", cards
02/03 rewritten, **new card 04 "Traceable to the batch"**, ISO chips relocated to `.steps-creds`.
The dial is data-driven so 4 cards "just work" — only change was mobile `stepDeg` 30→22 so rotation
(stepDeg×3) stays inside the ±66° tick arc; counter HTML `/03`→`/04`; static fallback grid → 2×2.
· C2 head (canonical, og:type, twitter card, aligned og:description) · C3 title + meta · C5 H3
descriptors · C6 JSON-LD (`Organization` areaServed GB + 3×`Product` + `BreadcrumbList`).

**A2 (marquee):** already satisfied — the old "certainty of aluminium" marquee was replaced last
session; current USP ticker doesn't contain it. **"certainty" count:** left the hero couplet + its
scroll-reveal echo + finishes + footer brand sign-off (deliberate brand echoes, not dilutive tics);
only the systems-intro repeat was removed (A3).

**Conformance pass 2 (2026-07-17, client re-sent the same schedule asking for full adjustment):**
- **C4 eyebrows ADDED after all** — the user reversed their earlier "keep them off" call when the client
  re-sent the doc. Six `p.eyebrow` micro-labels (doc strings verbatim) above the section H2s; styled in the
  site's 0.12em uppercase micro-label voice, blue on light sections / lblue on dark. Specificity notes: the
  base rule is `p.eyebrow` (beats `.plank-copy p`), plus a `.projects-intro p.eyebrow` override because the
  projects styles sit LATER in the file and win ties. The no-kicker rule is now void for these SEO eyebrows.
- **C7 done** — case images renamed via `git mv`: `tower-vert`→`case-merle-court`, `float/f07`→
  `case-riverside-quarter`, `float/f03`→`case-harbour-view`, `float/f09`→`case-elmwood-court` (refs only in
  `index.html` now; the other session's case-study rework removed the main.js CASES array).
- **C2 noindex ADDED** — `<meta name="robots" content="noindex">` with a loud STAGING-ONLY comment; MUST be
  removed in the production-domain build (canonical already points at vulcansystems.co.uk).
- **A9 finished** — footer tag's brand couplet dropped (visible "certainty" now exactly 2: hero + finishes);
  systems intro "Every"→"Each"; hero proof strip trimmed to the doc's exact `A2-s1,d0 classified · CWCT
  tested`. Remaining "every"s are all inside the doc's own mandated replacement copy.

**Section D built (2026-07-17, client pushed for them; interim mechanics until real content arrives):**
- **D1(b)** — "Also in 400 Series" `.series-tag` on the **VulcaLap** panel. RESOLVED 2026-07-21:
  client confirmed 400 Series is a **VulcaLap** sub-variant (the change-schedule's "VulcaBar 400
  Series" heading was wrong); tag was moved off VulcaBar accordingly.
- **D2** — "Copy NBS clause" `.btn-nbs` on all three system panels (in a new `.hpan-ctas` row).
  Copies a **DRAFT clause** (each copied text is headed "DRAFT - confirm with Vulcan before issue")
  from the `NBS_CLAUSES` map in `main.js` — **swap that map for Vulcan's real NBS copy when supplied**.
  Success state "Copied" (2.2s), clipboard-API + textarea fallback, and fires a
  `dataLayer` `nbs_clause_copy` conversion event ready for GTM/Clarity at dev stage.
- **D3** — real `#downloads` section (between projects and contact): split header + six `.dl-row`
  document rows (test certs / datasheets / CAD & Revit / install guides / EPDs / warranty), each a
  **mailto request link** with a prefilled subject — swap each mailto for a direct file link as
  documents arrive. Nav, mobile menu and footer "Downloads" now link to it; all `.nav-soon`/`.f-soon`
  "coming soon" buttons are GONE.

**Deferred / needs input (NOT done):**
- **C1** three product pages (`/vulcalap` etc.) — phase two; the single-page SEO ceiling stands until then.
- **D1 "VulcaBar 400 Series"** — the schedule treats it as a new product, but "400 Series" was RENAMED to
  VulcaFrame in this build. Contradiction — needs client clarification before adding anything.
- **D2 NBS copy-to-clipboard** — needs the actual NBS clause text. **D3 Downloads section** — needs the files
  (both nav items still "coming soon"). **D4 footer clock** — not a bug; `tickClock()` runs on load, `--:--`
  is only the no-JS placeholder.
- **Claims to confirm with client:** Qualicoat approval, 25-year finish warranty (A6), batch-level
  traceability (card 04, E4). Canonical/JSON-LD assume `vulcansystems.co.uk` is the production domain.

### 02 section drawing CORRECTED (it was wrong)
The first section drawing was checked against source and rebuilt. What was wrong:
invented layer stack; ~7mm of empty space between plank and rail (so the plank fixed to
nothing) plus phantom voids between every wall layer; the concealed fixing ran through
the course above on its way to the rail; and a **fabricated "14" thickness dimension**
that came from the placeholder profile in plank.js, not from Vulcan.
Now: layer order + naming follow Vulcan's OWN published build-up, extracted from the
hotspot annotations on the live VulcaLap page (sheathing board -> breather membrane ->
wall insulation -> helping-hand brackets & vertical cladding rails at 600mm c/c ->
VulcaLap plank; Vulcan 25mm ZED). Layers contiguous; fixing leg at the REAR so the
fixing runs straight into the rail; face carries the shiplap rebate visible on the
client's renders; insulation drawn BROKEN (its depth is a project decision).
Only published dimensions are shown: **150 cover** (the profile name), **25 cavity**
(the ZED), **600mm c/c** as a note (rails run perpendicular to this cut, so their
spacing is not measurable in this view).
**Deliberately NOT drawn: the Tenmat cavity barriers and intumescent components** that
appear in the client's hotspots — brief hard rule, certification is shown as achieved,
never how. Do not add them. The caption says they are specified per project.

## Open follow-ups (most relevant first)
- [ ] **Social URLs** for the utility rail (LinkedIn / Instagram / YouTube are `#`).
- [x] ~~Confirm hero Google rating~~ — the consumer Google-reviews strip was **replaced with a
      specifier-facing credentials cue** ("Independently certified · CWCT tested · ISO 9001 &
      14001", shield-check icon) after a brief-alignment review flagged it as off-tone for the
      premium B2B audience. Built only from certs already asserted elsewhere — no client number
      needed. Reversible if the client would rather show a real rating.
- [x] **Hero poster** `hero.jpg` regenerated from frame 0 of the 2026-10-13 hero footage (22.8s drone clip, 1080p, 7.8MB).
- [ ] **Inner pages** — Products ×2 remaining (VulcaBar/VulcaFrame), About, Downloads, Colours,
      Contact (name+number → Pipedrive). ~~Case Studies (filterable)~~ — BUILT 2026-08-18
      (cases.html + 2 project files, see above). The nav dropdown and Downloads/Colours
      items are positioned to receive real URLs.
- [ ] **Real content pass** — case-study captions/project names/stats are placeholders. The
      gallery is now a **paged carousel**: prev/next arrows + an `NN–NN / NN` counter in the
      `.projects-head`, backed by the `CASES` array in `main.js` (single source of truth). It
      currently holds **6 placeholder schemes** — the original 3 plus 3 extras that reuse the
      contact float images (`float/f07,f03,f09.jpg`) so the arrows have somewhere to go. Swap
      `CASES` for the client's real projects (or wire to a CMS); arrows auto-hide at ≤1 page,
      and the 3 on-screen slots stay the same DOM elements (content swaps on page).
- [ ] **PROJECT-HANDOFF.md refresh** — several sections describe removed components.
- [ ] Dev-stage functional reqs — Pipedrive capture, Calendly-style booking, MS Clarity.
