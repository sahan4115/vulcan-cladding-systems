/* ==========================================================================
   HERO — the build-up, clad course by course.

   A scroll-scrubbed FRAME SEQUENCE, not a <video>. Seeking a video element is
   asynchronous and lands on the nearest keyframe, so scrubbing one stutters and
   reads differently forwards vs backwards. A decoded frame array is exact in
   both directions and costs nothing to sample.

   Deliberately exposes the SAME shape as initFacade() — `{ apply(p) }` plus the
   `labels` / `onProgressEls` contract — so the hero can be swapped back to the
   procedural 3D module by changing one import in vulcalap.js. facade.js is NOT
   dead code; it is the fallback.

   Source frames: public/assets/img/buildup/f001..f121.webp (820x1028), the
   white backdrop pre-blended into --paper so the stage sits flush on the page.
   ========================================================================== */
import gsap from 'gsap';

const FRAMES = 121;
/* smallest breathing room ever allowed between the copy text and the stage ink */
const MIN_GAP = 32;
const SRC = (i) =>
  `${import.meta.env.BASE_URL}assets/img/buildup/f${String(i).padStart(3, '0')}.webp`;

/* eased sub-segment of the master progress: 0 before a, 1 after b (same helper
   and same easing as facade.js, so the DOM beats keep their exact feel) */
const seg = (p, a, b, ease = 'power2.inOut') =>
  gsap.parseEase(ease)(gsap.utils.clamp(0, 1, (p - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;

/* Callout anchors. The 3D module projected these from real scene positions;
   a frame sequence has no scene, so each label is placed in NORMALISED STAGE
   SPACE (0..1 of the drawn image, not the canvas) and converted to pixels
   against the letterboxed draw rect — that keeps them locked to the artwork at
   every viewport. `a` is when it fades in, `b` when it leaves.
   Timings follow the animation: substructure is legible early, the plank face
   and its interlock only once the courses are actually up.

   Positions were read off the actual frames (820x1028), not estimated: the left
   cladding rail sits at ~0.23x, the insulation face with its vent at ~0.65x, and
   once the courses are up the plank face reads at ~0.35x/0.75y with the section
   cut down the right edge at ~0.88x. Timings follow the clip — it clads from the
   bottom course upward, so a point low on the wall is covered early and one high
   on it stays exposed late. Re-tune BOTH pairs if the frame sequence is replaced. */
const ANCHORS = {
  /* the two pairs must HAND OVER, not overlap — the substructure labels are gone
     before the plank ones arrive, so the hero never carries more than two at once.
     `side` sends the label box out into that margin; the two co-active labels always
     take OPPOSITE sides so their boxes can never collide. */
  rail:    { x: 0.23, y: 0.38, a: 0.08, b: 0.40, side: 'left' },
  buildup: { x: 0.65, y: 0.50, a: 0.14, b: 0.44, side: 'right' },
  plank:   { x: 0.35, y: 0.75, a: 0.54, b: 0.92, side: 'left' },
  fix:     { x: 0.88, y: 0.62, a: 0.66, b: 0.92, side: 'right' },
};

export function initBuildup(canvas, { reduce = false, labels = [], onProgressEls = {} } = {}) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const imgs = new Array(FRAMES);
  let loaded = 0;
  let ready = false;

  const copyEl = onProgressEls.copy || null;
  const beatEl = onProgressEls.beat || null;
  const hintEl = onProgressEls.hint || null;
  const progEl = onProgressEls.progress || null;
  const stageEl = onProgressEls.stage || null;
  let stageWord = '';
  let lastIndex = -1;
  let lastPlace = -1;
  let lastP = 0;

  /* the rect the current frame is drawn into — labels resolve against THIS,
     never against the canvas, or they drift as the letterbox changes */
  let draw = { x: 0, y: 0, w: 0, h: 0 };

  /* Layout facts about the copy column, needed to place the stage beside it.
     Measured, not assumed — and cached, because it only changes when the canvas
     is resized (a reflow of the copy implies a reflow of the hero). */
  let copyRight = 0;
  let gutterPx = 0;

  /* The rendered frame is not flush to its own edges — it carries baked-in paper
     padding, and unevenly (more on the left than the right). Centring the DRAW RECT
     therefore does not centre what you can actually SEE, which showed up as 191px of
     gap on one side against 78px on the other. Measure the first frame's ink bounds
     once and place against those instead. Self-correcting if the frames are replaced. */
  let inset = { l: 0, r: 0 };
  const measureInset = (img) => {
    try {
      const W = 160;
      const H = Math.round((W * img.naturalHeight) / img.naturalWidth);
      const o = document.createElement('canvas');
      o.width = W; o.height = H;
      const oc = o.getContext('2d', { willReadFrequently: true });
      oc.drawImage(img, 0, 0, W, H);
      const d = oc.getImageData(0, 0, W, H).data;
      let x0 = W, x1 = 0;
      for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          if (Math.abs(d[i] - 244) + Math.abs(d[i + 1] - 247) + Math.abs(d[i + 2] - 250) > 26) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
          }
        }
      }
      if (x1 > x0) inset = { l: x0 / W, r: (W - 1 - x1) / W };
    } catch (e) {
      /* a tainted or undecoded canvas must not break the hero — fall back to flush */
      inset = { l: 0, r: 0 };
    }
  };
  const measureCopy = () => {
    if (!copyEl) return;
    /* --gutter can NOT be read with getPropertyValue — a custom property comes back
       as the literal calc() string and parseFloat gives NaN. A resolved padding does
       come back in px. */
    gutterPx = parseFloat(getComputedStyle(copyEl).paddingLeft) || 0;
    const base = canvas.getBoundingClientRect().left;
    /* the widest INKED child. The copy box itself is a fixed min(56%,760) and sits
       far to the right of where the text actually stops, which is what made the gap
       look bigger than it was. .phero-copy is a grid with justify-items:start, so
       each child shrinks to its own content. */
    const kids = [...copyEl.children].map((el) => el.getBoundingClientRect().right - base);
    copyRight = kids.length ? Math.max(...kids) : gutterPx;
  };

  const fit = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return false;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      measureCopy();
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  };

  /* Where a callout's BOX sits, and where its leader starts.
     `wide` is the whole point: only when the stage has genuinely centred is there
     margin to put a label in. Below that the box falls back on top of the artwork
     (the CSS halo keeps it legible) rather than being pushed off-canvas. */
  const MARGIN_MIN = 132;
  const labelGeom = (key) => {
    const A = ANCHORS[key];
    const ax = draw.x + A.x * draw.w;
    const ay = draw.y + A.y * draw.h;
    const gap = 22;
    const room = A.side === 'left' ? draw.x : canvas.clientWidth - (draw.x + draw.w);
    const wide = room > MARGIN_MIN;
    const bx = wide ? (A.side === 'left' ? draw.x - gap : draw.x + draw.w + gap) : ax;
    return { ax, ay, bx, by: ay, wide, side: A.side };
  };

  const paint = (i, p) => {
    const img = imgs[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.fillStyle =
      getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#f4f7fa';
    ctx.fillRect(0, 0, w, h);

    /* COMPOSITION IS SCROLL-DRIVEN. At p=0 the stage sits right, small enough to
       leave the headline its own column. As the copy clears it glides to CENTRE and
       grows — which is what opens the margins the callouts then live in. Both the
       position and the scale come off one eased value so they can never disagree. */
    const portrait = h > w;
    const place = seg(p, 0.06, 0.32);
    /* 0.86 at rest: the artwork is HEIGHT-constrained (it is portrait in a short
       hero), so it cannot grow sideways to fill a wide screen — under-scaling it
       just opens dead space between the headline and the stage. */
    const pad = portrait ? 0.92 : lerp(0.9, 0.94, place);
    let s = Math.min((w * pad) / img.naturalWidth, (h * pad) / img.naturalHeight);
    if (!portrait) {
      /* AT REST the ink must also FIT THE COLUMN beside the copy. On squarer
         viewports (e.g. 1100x800) the viewport-based scale produces ink wider than
         the column, and no placement can fix that — the right-edge clamp just shoved
         it 15px into the headline. The constraint dissolves as the copy leaves. */
      const colW = w - gutterPx - copyRight - MIN_GAP * 2;
      const sCol = colW / (img.naturalWidth * (1 - inset.l - inset.r));
      s = lerp(Math.min(s, sCol), s, place);
    }
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    /* AT REST the stage is CENTRED IN THE COLUMN BESIDE THE COPY — not right-aligned.
       It is height-constrained, so on a wide screen it cannot grow to fill the row;
       right-aligning it therefore pooled all the slack into one void next to the
       headline (~558px at 1900 wide). Centring splits that slack in two, so it reads
       as margin on both sides instead of a hole in the middle. The column runs from
       the real text edge (not the copy BOX, which is a fixed 760 and much wider than
       the text) to the page container edge, and MIN_GAP stops it crowding the copy. */
    /* The column runs from where the copy's text actually STOPS to the page container
       edge, and the ink is centred in it — so the slack lands as an equal margin either
       side rather than one void. MIN_GAP is only a FLOOR: adding it to colStart instead
       would shift the whole centring window right and re-open the asymmetry it is meant
       to prevent, so it clamps the result rather than framing it. */
    const colStart = copyRight;
    const colEnd = w - gutterPx;
    /* centre the INK, not the draw rect (see `inset`) */
    const inkW = dw * (1 - inset.l - inset.r);
    const inkX = Math.max(colStart + (colEnd - colStart - inkW) / 2, colStart + MIN_GAP);
    const restX = Math.min(inkX - inset.l * dw, colEnd - dw * (1 - inset.r));
    const dx = portrait ? (w - dw) / 2 : lerp(restX, (w - dw) / 2, place);
    const dy = portrait ? h - dh - h * 0.05 : (h - dh) / 2;
    draw = { x: dx, y: dy, w: dw, h: dh };
    ctx.drawImage(img, dx, dy, dw, dh);

    /* leader lines, drawn on the canvas so they are exact against the artwork.
       Elbowed, not diagonal — this is a technical drawing, not a callout bubble. */
    labels.forEach((lb) => {
      const on = lb._on || 0;
      if (on <= 0.01) return;
      const g = labelGeom(lb.key);
      if (!g.wide) return;
      ctx.save();
      ctx.globalAlpha = on * 0.42;
      ctx.strokeStyle =
        getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#0e2434';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const elbow = g.side === 'left' ? g.ax - (g.ax - g.bx) * 0.55 : g.ax + (g.bx - g.ax) * 0.55;
      ctx.moveTo(g.ax, g.ay + 0.5);
      ctx.lineTo(elbow, g.ay + 0.5);
      ctx.lineTo(g.bx, g.by + 0.5);
      ctx.stroke();
      ctx.restore();
    });
  };

  /* ---- the single entry point: render the hero at progress p (0..1) ---- */
  const apply = (p) => {
    lastP = p;
    if (!fit()) return;

    /* opacities FIRST: paint() draws the leader lines, so it has to know which
       callouts are live and how faded they are before it strokes anything */
    labels.forEach((lb) => {
      const A = ANCHORS[lb.key];
      lb._on = A ? seg(p, A.a, A.a + 0.06) * (1 - seg(p, A.b, A.b + 0.06)) : 0;
    });

    const want = Math.round(gsap.utils.clamp(0, 1, p) * (FRAMES - 1));
    /* paint the nearest LOADED frame, not the exact one: mid-stream (and under the
       Save-Data sparse set) the exact frame may not exist yet, and a blank hero is
       far worse than a coarse scrub. Earlier neighbour wins the tie so the cladding
       never appears ahead of the scroll. */
    const i = nearestLoaded(want);
    /* the composition moves continuously, so a repaint is needed whenever the
       frame OR the placement changes — keying on the frame index alone would
       freeze the glide-to-centre between frame boundaries */
    const place = seg(p, 0.06, 0.32);
    if (i !== lastIndex || place !== lastPlace || !ready) {
      lastIndex = i;
      lastPlace = place;
      paint(i, p);
    }

    /* DOM beats — identical thresholds to facade.js so the choreography and the
       copy timing are unchanged by the swap */
    if (copyEl) {
      const t = seg(p, 0.06, 0.18, 'power1.in');
      copyEl.style.opacity = String(1 - t);
      copyEl.style.transform = `translateY(${t * -46}px)`;
      copyEl.style.pointerEvents = t > 0.6 ? 'none' : '';
    }
    if (hintEl) hintEl.style.opacity = String(1 - seg(p, 0.02, 0.1));

    labels.forEach((lb) => {
      if (!ANCHORS[lb.key]) return;
      const on = lb._on || 0;
      lb.el.style.opacity = String(on);
      if (on > 0.001 && draw.w) {
        const g = labelGeom(lb.key);
        /* a left-side box has to extend LEFT from its point, which is exactly what
           .flip does — so the class is driven here, not hardcoded in the markup */
        lb.el.classList.toggle('flip', g.side === 'left');
        /* out in the margin the leader line already connects it, so the box drops
           its own little stub-and-dot; on top of the artwork it keeps it */
        lb.el.classList.toggle('at-edge', g.wide);
        lb.el.style.transform = `translate(${g.bx.toFixed(1)}px, ${g.by.toFixed(1)}px)`;
      }
    });

    if (beatEl) {
      const t = seg(p, 0.9, 0.985);
      beatEl.style.opacity = String(t);
      beatEl.style.transform = `translateY(${(1 - t) * 34}px)`;
    }
    if (progEl) progEl.style.transform = `scaleY(${p.toFixed(4)})`;
    if (stageEl) {
      /* the words now describe THIS animation, not the exploded 3D one */
      const w = p < 0.16 ? 'Substructure' : p < 0.82 ? 'Cladding' : 'Clad';
      if (w !== stageWord) {
        stageWord = w;
        stageEl.textContent = w;
      }
    }
  };

  /* ---- preload ----------------------------------------------------------
     Frame 1 is fetched and painted first so the hero is never blank, then the
     rest stream in.

     ⚠️ Resolve on `onload`, and NEVER await `decode()`. In a hidden document
     (a background tab — cmd-click, "open in new tab", or a preview pane that is
     not compositing) `img.decode()` neither resolves NOR rejects: it just hangs,
     so a `.then/.catch` fallback never runs and the whole sequence stalls, which
     leaves the hero permanently blank. `onload` does fire when hidden — verified
     in-browser. decode() is still fired, unawaited, purely to warm the decoder so
     the first drawImage stays off the main thread; whichever settles first wins. */
  const load = (i) =>
    new Promise((res) => {
      const img = new Image();
      img.decoding = 'async';
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        imgs[i] = img;
        loaded += 1;
        res();
      };
      img.onload = done;
      img.onerror = () => {
        if (settled) return;
        settled = true;
        loaded += 1;
        res();
      };
      img.src = SRC(i + 1);
      img.decode?.().then(done).catch(() => {});
    });

  /* nearest loaded frame to i, earlier neighbour preferred on the tie */
  const nearestLoaded = (i) => {
    if (imgs[i]) return i;
    for (let d = 1; d < FRAMES; d++) {
      if (imgs[i - d]) return i - d;
      if (imgs[i + d]) return i + d;
    }
    return i;
  };

  const boot = async () => {
    /* Reduced motion sees ONE static frame — the finished wall — so fetch exactly
       that and stop. Loading all 121 (4.2 MB) for a user who will never scrub was
       the single biggest waste on the page. */
    if (reduce) {
      await load(FRAMES - 1);
      if (imgs[FRAMES - 1]) measureInset(imgs[FRAMES - 1]);
      ready = true;
      apply(1);
      return;
    }
    await load(0);
    if (imgs[0]) measureInset(imgs[0]);
    apply(0);
    /* Save-Data / 2G gets a SPARSE set — every 4th frame plus the last (~1.1 MB).
       nearestLoaded() makes the scrub coarse instead of broken. */
    const conn = navigator.connection;
    const lite = !!(conn && (conn.saveData || /2g$/.test(conn.effectiveType || '')));
    const wanted = [];
    for (let i = 1; i < FRAMES; i++) {
      if (!lite || i % 4 === 0 || i === FRAMES - 1) wanted.push(i);
    }
    /* modest concurrency: 121 parallel requests starve the rest of the page */
    let next = 0;
    const worker = async () => {
      while (next < wanted.length) {
        const i = wanted[next++];
        await load(i);
        if (loaded % 24 === 0) apply(lastP);
      }
    };
    await Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]);
    ready = true;
    lastIndex = -1;
    apply(lastP);
  };
  boot();

  /* a resize changes the letterbox, so the frame AND the labels must be redrawn */
  let rAF = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => {
      lastIndex = -1;
      apply(lastP);
    });
  });

  /* QA hook — mirrors window.__facade so existing capture scripts still work */
  window.__buildup = {
    apply,
    frames: FRAMES,
    get loaded() {
      return loaded;
    },
    get ready() {
      return ready;
    },
  };

  return { apply, get ready() { return ready; } };
}
