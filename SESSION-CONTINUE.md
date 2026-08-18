# Vulcan — Session Continuation

Handoff for picking this up in a fresh chat. Read [`PROJECT-HANDOFF.md`](PROJECT-HANDOFF.md)
for the original project context, **but note it is stale in places** (it still describes the
constellation contact, product-name marquee, factory band, "400 Series" and wedge clip-paths —
all replaced this session; trust this file and the code over it).

Last session: 2026-07-03. Live URL: https://sahan4115.github.io/vulcan-cladding-systems/

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

## Client video supplied, NOT yet used: `T-G-Buildup.mp4`
User's Downloads, 2026-08-18. Vulcan's REAL CAD install animation — 1280x720, 25fps,
54s, no audio, 6.7 MB (re-encodes to 3.1 MB h264 / 1.6 MB VP9 at 720p).
Arc: membrane roll -> substructure -> planks bottom-up round a corner -> close-up on
the concealed fixing -> clad. Real geometry, not an AI reinterpretation.
**Recommendation given: put it in 02 "The joint does the work"** (same subject as that
section's SVG joint drawing), NOT the hero — it is 16:9 in a dark OSB environment vs
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
- Static ffmpeg (not on PATH): `find "$LOCALAPPDATA/Temp/claude/C--IPS" -name ffmpeg.exe`.
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
