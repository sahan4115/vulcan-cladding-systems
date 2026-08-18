/*
 * VulcaLap product page entry.
 * Shares the homepage's chrome (nav, mobile menu, dropdowns, reveals, magnetic CTAs,
 * contact wall, NBS copy, footer clock) — duplicated deliberately from main.js so the
 * verified homepage bundle stays untouched. Page-specific work: the 3D system hero
 * (src/facade.js), the product rail scrollspy, the scroll-traced section drawing,
 * the finish configurator and the spec ledger.
 */
import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import './styles.css';
import './vulcalap.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
/* The hero is a scroll-scrubbed frame sequence (buildup.js). facade.js is the
   procedural 3D build-up it replaced — kept, and kept working: both export the
   same { apply(p) } contract, so swapping this import back restores it. */
import { initBuildup } from './buildup.js';

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(pointer: fine)').matches;
document.documentElement.classList.add('js');
if (reduce) document.documentElement.classList.add('reduced');

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
}

const scrollToPos = (target) => {
  if (lenis) lenis.scrollTo(target, { offset: 0 });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else target.scrollIntoView();
};

/* ---------- Nav: solid always on inner pages; hides down / shows up ---------- */
const nav = document.querySelector('.nav');
const pnav = document.querySelector('.pnav');
const mm = gsap.matchMedia();
if (!reduce) {
  const navTween = gsap.quickTo(nav, 'yPercent', { duration: 0.45, ease: 'power3.out' });
  ScrollTrigger.create({
    start: 'top top',
    onUpdate: (self) => {
      const up = self.scroll() >= 120 && self.direction !== -1 && !nav.classList.contains('menu-open');
      navTween(up ? -100 : 0);
      /* the product rail rides up to the top edge while the main nav is away */
      document.body.classList.toggle('nav-up', up);
    },
  });
}

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToPos(el);
  });
});

/* ---------- Mobile menu ---------- */
const burger = document.querySelector('.nav-burger');
const menu = document.querySelector('.mobile-menu');
const closeMenu = () => {
  menu.classList.remove('open');
  nav.classList.remove('menu-open');
  burger.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  if (lenis) lenis.start();
};
burger.addEventListener('click', () => {
  const open = !menu.classList.contains('open');
  menu.classList.toggle('open', open);
  nav.classList.toggle('menu-open', open);
  gsap.set(nav, { yPercent: 0 });
  burger.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  if (lenis) open ? lenis.stop() : lenis.start();
});

/* ---------- Nav dropdowns (hover via CSS; click for touch) ---------- */
const drops = [...document.querySelectorAll('.nav-drop')];
const setDrop = (drop, open) => {
  drop.classList.toggle('open', open);
  drop.querySelector('.nav-drop-btn').setAttribute('aria-expanded', String(open));
};
drops.forEach((drop) => {
  drop.querySelector('.nav-drop-btn').addEventListener('click', () => {
    const open = !drop.classList.contains('open');
    drops.forEach((d) => setDrop(d, d === drop ? open : false));
  });
  drop.querySelectorAll('.nav-drop-menu a').forEach((a) => a.addEventListener('click', () => setDrop(drop, false)));
});
if (drops.length) {
  document.addEventListener('click', (e) => {
    drops.forEach((drop) => { if (!drop.contains(e.target)) setDrop(drop, false); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') drops.forEach((drop) => setDrop(drop, false));
  });
}

/* ---------- HERO: the system experience ---------- */
const heroCanvas = document.getElementById('phero-canvas');
const heroPin = document.getElementById('pheroPin');
if (heroCanvas) {
  const labels = [...document.querySelectorAll('.plabel')].map((el) => ({
    el,
    key: el.dataset.key,
    a: parseFloat(el.dataset.a),
  }));
  const facade = initBuildup(heroCanvas, {
    reduce,
    labels,
    onProgressEls: {
      copy: document.getElementById('pheroCopy'),
      beat: document.getElementById('pheroBeat'),
      hint: document.getElementById('pheroHint'),
      progress: document.getElementById('pheroFill'),
      stage: document.getElementById('pheroStage'),
    },
  });

  if (!reduce) {
    /* entrance: the title rises before the scroll takes over */
    gsap.from('.phero-copy > *', { y: 34, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.15 });

    const proxy = { p: 0 };
    gsap.to(proxy, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: heroPin,
        start: 'top top',
        end: '+=340%',
        pin: true,
        scrub: 0.55,
        anticipatePin: 1,
      },
      onUpdate: () => facade.apply(proxy.p),
    });
  }
}

/* ---------- Product rail: show after the experience, spotlight the section in view ---------- */
if (pnav) {
  ScrollTrigger.create({
    trigger: '#overview',
    start: 'top 65%',
    end: 'max',
    onToggle: (self) => pnav.classList.toggle('on', self.isActive),
  });
  const spyLinks = [...pnav.querySelectorAll('.pnav-links a')];
  /* past the last spied section (the finale), nothing is "current" */
  ScrollTrigger.create({
    trigger: '#enquire',
    start: 'top 45%',
    end: 'bottom top',
    onToggle: (self) => {
      if (self.isActive) spyLinks.forEach((l) => l.classList.remove('is-active'));
    },
  });
  spyLinks.forEach((a) => {
    const sec = document.querySelector(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) {
          spyLinks.forEach((l) => l.classList.toggle('is-active', l === a));
        }
      },
    });
  });
}

/* ---------- Statement: words light up as they are read ---------- */
const stmt = document.querySelector('[data-words]');
if (stmt) {
  const words = stmt.textContent.trim().split(/\s+/);
  stmt.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
  if (!reduce) {
    gsap.to(stmt.querySelectorAll('.w'), {
      opacity: 1,
      stagger: 0.045,
      ease: 'none',
      scrollTrigger: { trigger: stmt, start: 'top 78%', end: 'bottom 45%', scrub: true },
    });
  }
}

/* ---------- Section reveals + image treatments (same utilities as the homepage) ---------- */
if (!reduce) {
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 84%', once: true },
    });
  });
  gsap.utils.toArray('[data-clip]').forEach((el) => {
    gsap.to(el, {
      clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 38%', scrub: true },
    });
  });
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -7 }, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
} else {
  gsap.set('[data-reveal]', { opacity: 1, y: 0 });
}

/* ---------- Engineered detail: the section drawing draws itself ---------- */
const draw = document.getElementById('pdDraw');
if (draw && !reduce) {
  const traces = [...draw.querySelectorAll('[data-trace]')];
  traces.forEach((el) => {
    const len = el.getTotalLength ? el.getTotalLength() : 1200;
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
  });
  const tl = gsap.timeline({
    scrollTrigger: { trigger: draw, start: 'top 78%', end: 'top 22%', scrub: 0.6 },
  });
  tl.to(traces, { strokeDashoffset: 0, ease: 'none', stagger: 0.06 })
    .from(draw.querySelectorAll('.dwg-dims, .dwg-notes, .dwg-fill, #hatch'), { opacity: 0, duration: 0.35, stagger: 0.08 }, 0.45);
}

/* ---------- 03 THE RECORD PLATE -------------------------------------------
   Scroll runs a cutting pass that machines each line into the plate; the lines
   are engraved by default in CSS, so this only ever ENHANCES something already
   readable (no-JS and reduced-motion both ship a complete plate).
   Selecting a line picks the document that evidences that claim, and the pack
   CTA turns on once anything is chosen.
   ------------------------------------------------------------------------- */
const recPlate = document.getElementById('recPlate');
if (recPlate) {
  const lines = gsap.utils.toArray('.rec-line');
  const hits = gsap.utils.toArray('.rec-hit');
  const countEl = document.getElementById('recCount');
  const meterEl = document.getElementById('recMeter');
  const ctaEl = document.getElementById('recCta');
  const hintEl = document.getElementById('recHint');
  const picked = new Set();

  const sync = () => {
    const n = picked.size;
    countEl.textContent = String(n);
    meterEl.style.transform = `scaleX(${(n / hits.length).toFixed(3)})`;
    ctaEl.disabled = n === 0;
    hintEl.textContent = n === 0
      ? 'Pick the evidence you need — it arrives in one email.'
      : n === hits.length
        ? 'The full pack. We send it with the datasheet as standard.'
        : `${n} selected — add more, or ask for these.`;
  };

  hits.forEach((hit) => {
    hit.addEventListener('click', () => {
      const on = hit.getAttribute('aria-pressed') !== 'true';
      hit.setAttribute('aria-pressed', String(on));
      const doc = hit.dataset.doc;
      on ? picked.add(doc) : picked.delete(doc);
      if (on && !reduce) {
        /* the tick is struck, not faded: a short hard punch into the metal */
        gsap.fromTo(hit.querySelector('.rec-tick'),
          { scale: 0.82 }, { scale: 1, duration: 0.34, ease: 'back.out(2.6)' });
      }
      sync();
    });
  });
  sync();

  /* the CTA carries the selection into the enquiry */
  ctaEl.addEventListener('click', () => {
    const docs = [...picked];
    const subject = encodeURIComponent('VulcaLap evidence pack request');
    const body = encodeURIComponent(
      'Please send the following VulcaLap documents:\n\n' + docs.map((d) => `- ${d}`).join('\n') +
      '\n\nProject:\nName:\nContact number:\n');
    /* high-intent event — picked up when analytics lands */
    (window.dataLayer = window.dataLayer || []).push({ event: 'evidence_pack_request', documents: docs });
    window.location.href = `mailto:sales@vulcansystems.co.uk?subject=${subject}&body=${body}`;
  });

  if (!reduce) {
    /* machine them in, one line after the next */
    gsap.set(lines, { '--cut': '100%' });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: recPlate, start: 'top 78%', end: 'bottom 72%', scrub: 0.6 },
    });
    lines.forEach((ln, i) => {
      tl.to(ln, {
        '--cut': '0%', duration: 1, ease: 'power1.inOut',
        onStart: () => ln.classList.add('cutting'),
        onComplete: () => ln.classList.remove('cutting'),
        onReverseComplete: () => ln.classList.remove('cutting'),
      }, i * 0.72);
    });

    /* the plate sits on the navy as an object: it leans a little toward you */
    if (fine) {
      const rx = gsap.quickTo(recPlate, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(recPlate, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      gsap.set(recPlate, { transformPerspective: 1400 });
      recPlate.addEventListener('pointermove', (e) => {
        const r = recPlate.getBoundingClientRect();
        rx((0.5 - (e.clientY - r.top) / r.height) * 3.2);
        ry(((e.clientX - r.left) / r.width - 0.5) * 4);
      });
      recPlate.addEventListener('pointerleave', () => { rx(0); ry(0); });
    }
  }
}

/* ---------- 04 WHERE IT BELONGS -------------------------------------------
   Four full-bleed applications. Moving between them RE-CLADS the frame course
   by course: the incoming photograph arrives as horizontal bands sweeping in
   from alternating sides, the way the system actually goes up. Everything is
   derived from one scrub value, so it is exact in both directions.
   ------------------------------------------------------------------------- */
const WB = [
  { img: 'app-highrise',   name: 'High-rise residential',
    line: 'Rainscreen cladding above 18 metres, where the timber look is wanted and combustible materials are not.' },
  { img: 'app-overclad',   name: 'Overcladding &amp; remediation',
    line: 'A new fa\u00e7ade over existing brick, steel or concrete \u2014 light enough not to overload the frame.' },
  { img: 'app-soffit',     name: 'Soffits, fascias &amp; bargeboards',
    line: 'The same profile carried around into the underside, so the whole envelope reads as one material.' },
  { img: 'app-commercial', name: 'Commercial &amp; education',
    line: 'Exterior and infill cladding for schemes where the envelope has to work as hard as it looks.' },
];
const wbSrc = (k) => `/assets/img/apps/${k}.webp`;

const wbPin = document.getElementById('wbPin');
if (wbPin) {
  const N = parseInt(getComputedStyle(wbPin).getPropertyValue('--bands'), 10) || 14;
  const baseL = document.getElementById('wbBase');
  const nextL = document.getElementById('wbNext');
  const nameEl = document.getElementById('wbName');
  const lineEl = document.getElementById('wbLine');
  const tabs = gsap.utils.toArray('.wb-tab');

  /* build the courses: each band is a window onto the same covered image */
  const build = (layer) => {
    layer.innerHTML = '';
    return Array.from({ length: N }, (_, j) => {
      const band = document.createElement('div');
      band.className = 'wb-band ' + (j % 2 ? 'from-r' : 'from-l');
      band.style.setProperty('--j', j);
      const im = document.createElement('img');
      im.alt = '';
      im.decoding = 'async';
      band.appendChild(im);
      layer.appendChild(band);
      return band;
    });
  };
  let baseBands = build(baseL);
  let nextBands = build(nextL);

  const setLayer = (bands, key) => {
    const src = wbSrc(key);
    bands.forEach((b) => { const im = b.firstChild; if (im.getAttribute('src') !== src) im.src = src; });
  };

  let curBase = -1;
  let curNext = -1;
  let shown = -1;
  let swapTl = null;

  const showCopy = (i) => {
    if (i === shown) return;
    shown = i;
    /* set synchronously, animate only the entrance: a deferred callback can be
       killed by the next change when scrolling fast and strand the copy */
    if (swapTl) swapTl.kill();
    nameEl.innerHTML = WB[i].name;
    lineEl.innerHTML = WB[i].line;
    swapTl = gsap.fromTo([nameEl, lineEl], { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07 });
    tabs.forEach((t, k) => t.classList.toggle('is-on', k === i));
  };

  const render = (p) => {
    const SEG = 1 / WB.length;
    const seg = Math.min(WB.length - 1, Math.floor(p / SEG));
    const t = (p - seg * SEG) / SEG;
    const last = seg === WB.length - 1;
    /* each application holds, then hands over in the last 45% of its segment */
    const rt = last ? 0 : gsap.utils.clamp(0, 1, (t - 0.55) / 0.45);

    if (seg !== curBase) { setLayer(baseBands, WB[seg].img); curBase = seg; }
    const nxt = Math.min(WB.length - 1, seg + 1);
    if (nxt !== curNext) { setLayer(nextBands, WB[nxt].img); curNext = nxt; }

    /* the courses land one after another, alternating sides */
    const D = 0.42;                       /* total stagger spread */
    const ease = gsap.parseEase('power2.inOut');
    nextBands.forEach((b, j) => {
      const d = (j / (N - 1)) * D;
      const bt = ease(gsap.utils.clamp(0, 1, (rt - d) / (1 - D)));
      const hide = ((1 - bt) * 100).toFixed(2);
      b.style.clipPath = j % 2 ? `inset(0 0 0 ${hide}%)` : `inset(0 ${hide}% 0 0)`;
      b.classList.toggle('laying', bt > 0.001 && bt < 0.999);
    });
    nextL.style.opacity = rt > 0 ? '1' : '0';

    showCopy(rt > 0.5 ? nxt : seg);

    /* the index doubles as the progress bar */
    tabs.forEach((tab, k) => {
      const fill = k < seg ? 1 : k > seg ? 0 : t;
      tab.querySelector('.wb-tab-bar i').style.transform = `scaleX(${fill.toFixed(3)})`;
    });
  };

  setLayer(baseBands, WB[0].img);
  setLayer(nextBands, WB[1].img);
  render(0);

  if (!reduce) {
    const st = ScrollTrigger.create({
      trigger: wbPin,
      start: 'top top',
      end: '+=360%',
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate: (self) => render(self.progress),
    });

    /* jump straight to an application */
    tabs.forEach((tab, k) => {
      tab.addEventListener('click', () => {
        const p = (k + 0.25) / WB.length;
        scrollToPos(st.start + p * (st.end - st.start));
      });
    });

    gsap.from(['.wb-eyeless', '.wb-index'], {
      y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: wbPin, start: 'top 70%', once: true },
    });
  } else {
    tabs.forEach((tab, k) => tab.addEventListener('click', () => { render((k + 0.25) / WB.length); }));
  }
}

/* ---------- 05 THE COAT ----------------------------------------------------
   One pinned composition. Scroll pours coat after coat down the stage: a single
   hard edge crosses the wall, the product panel and the headline together, then
   the wall splits into every coat at once and resolves into a finished building.
   The rail underneath reaches all 15 states at any time (hover / tap), and the
   scroll takes back over the moment you move.
   Assets: the client's own renders, background-keyed (panel-*) with the plank
   face sampled out as the wall surface (tile-*).
   -------------------------------------------------------------------------- */
const COATS = {
  raw:          { name: 'Uncoated extrusion',   spec: 'Mill finish — before coating',                 lum: 105 },
  cedar:        { name: 'Western Red Cedar',    spec: 'Wood-effect powder coat · A2 fire-rated',      lum: 144 },
  'light-oak':  { name: 'Light Oak',            spec: 'Wood-effect powder coat · A2 fire-rated',      lum: 134 },
  'golden-oak': { name: 'Golden Oak',           spec: 'Wood-effect powder coat · A2 fire-rated',      lum: 107 },
  teak:         { name: 'Teak',                 spec: 'Wood-effect powder coat · A2 fire-rated',      lum: 76 },
  'dark-oak':   { name: 'Dark Oak',             spec: 'Wood-effect powder coat · A2 fire-rated',      lum: 88 },
  rosewood:     { name: 'Rosewood',             spec: 'Wood-effect powder coat · A2 fire-rated',      lum: 89 },
  chestnut:     { name: 'Chestnut',             spec: 'Wood-effect powder coat · A2 fire-rated',      lum: 136 },
  ebony:        { name: 'Ebony',                spec: 'Wood-effect powder coat · A2 fire-rated',      lum: 50 },
  corten:       { name: 'Weathered Steel',      spec: 'Wood-effect powder coat · A2 fire-rated',      lum: 78 },
  bronze:       { name: 'Anodised Bronze',      spec: 'Anodised aluminium · A1 non-combustible',      lum: 108 },
  anthracite:   { name: 'RAL 7016 Anthracite',  spec: 'Powder coat · ISO 12944-6 (C4), 25 years',     lum: 54 },
  moss:         { name: 'RAL 7003 Moss Grey',   spec: 'Powder coat · ISO 12944-6 (C4), 25 years',     lum: 115 },
  ivory:        { name: 'RAL 1015 Light Ivory', spec: 'Powder coat · ISO 12944-6 (C4), 25 years',     lum: 183 },
  platinum:     { name: 'RAL 7036 Platinum',    spec: 'Powder coat · ISO 12944-6 (C4), 25 years',     lum: 131 },
};
/* `raw` has no wall surface: the building is simply unclad, so the navy stage
   shows through and the bare-metal panel reads bright against it. The first
   pour clads the wall and coats the panel in the same sweep. */
const tileUrl = (k) => (k === 'raw' ? 'none' : `url(/assets/img/finishes/tile-${k}.webp)`);
const panelUrl = (k) => `/assets/img/finishes/panel-${k}.webp`;
/* the wall is dark-veiled on the left, so type stays white until the coat is
   genuinely pale — ivory is the only one that needs ink */
const inkFor = (k) => (COATS[k].lum > 170 ? '#0e2434' : '#ffffff');

/* The narrative: every pour keeps the SAME panel geometry (all four are the
   shiplap-horizontal render), so only the coat appears to change. */
const POURS = [
  { to: 'cedar',      a: 0.10, b: 0.27 },
  { to: 'corten',     a: 0.30, b: 0.47 },
  { to: 'anthracite', a: 0.50, b: 0.66 },
];
const SPECTRUM = { a: 0.68, b: 0.83 };
const ARCH = { a: 0.84, b: 0.97 };

const coatPin = document.getElementById('coatPin');
if (coatPin) {
  const wallBase = document.getElementById('wallBase');
  const wallPour = document.getElementById('wallPour');
  const panelBase = document.getElementById('panelBase');
  const panelPour = document.getElementById('panelPour');
  const copyBase = document.getElementById('copyBase');
  const copyPour = document.getElementById('copyPour');
  const edge = document.getElementById('coatEdge');
  const spectrum = document.getElementById('coatSpectrum');
  const bands = gsap.utils.toArray('.coat-band');
  const arch = document.getElementById('coatArch');
  const closeEl = document.getElementById('coatClose');
  const panel = document.getElementById('coatPanel');
  const sws = gsap.utils.toArray('.coat-sw');

  /* Where each free-floating pour layer sits inside the stage. clip-path
     percentages resolve against the element's own box, so the panel and the
     headline would cut at their own mid-points instead of the wall's line —
     these are measured once and the cut is then set in absolute px. */
  const boxes = new Map();
  const measure = () => {
    const r0 = coatPin.getBoundingClientRect();
    [panelPour, copyPour, copyBase].forEach((el) => {
      const r = el.getBoundingClientRect();
      boxes.set(el, { top: r.top - r0.top, h: r.height, stage: r0.height });
    });
  };
  /* `above` keeps the part of the element above the edge (the incoming coat),
     `below` keeps the part under it (the coat being replaced). The wall and the
     panel only need `above`, because those layers are opaque images and simply
     cover what is behind them — but the copy is transparent text, so its two
     versions have to be cut complementarily or they read on top of each other. */
  const cutAt = (el, edgePx, side) => {
    const b = boxes.get(el);
    if (!b) return;
    if (side === 'below') {
      const top = gsap.utils.clamp(0, b.h, edgePx - b.top);
      el.style.clipPath = `inset(${top.toFixed(1)}px 0 0 0)`;
    } else {
      const bottom = gsap.utils.clamp(0, b.h, b.top + b.h - edgePx);
      el.style.clipPath = `inset(0 0 ${bottom.toFixed(1)}px 0)`;
    }
  };

  const setRead = (el, k) => {
    el.querySelector('[data-read="name"]').textContent = COATS[k].name;
    el.querySelector('[data-read="spec"]').textContent = COATS[k].spec;
  };

  /* paint(base, pour, t) — t is the pour progress, 0 = base only, 1 = poured */
  let painted = { base: null, pour: null };
  const paint = (base, pour, t) => {
    if (painted.base !== base) {
      wallBase.style.backgroundImage = tileUrl(base);
      panelBase.src = panelUrl(base);
      copyBase.style.setProperty('--ink-a', inkFor(base));
      setRead(copyBase, base);
      painted.base = base;
    }
    if (painted.pour !== pour) {
      wallPour.style.backgroundImage = tileUrl(pour);
      panelPour.src = panelUrl(pour);
      copyPour.style.setProperty('--ink-b', inkFor(pour));
      setRead(copyPour, pour);
      painted.pour = pour;
    }
    coatPin.style.setProperty('--edge', `${(t * 100).toFixed(2)}%`);
    const edgePx = t * (boxes.get(panelPour)?.stage || coatPin.offsetHeight);
    cutAt(panelPour, edgePx);
    cutAt(copyPour, edgePx);
    cutAt(copyBase, edgePx, 'below');
    edge.style.opacity = t > 0.001 && t < 0.999 ? '1' : '0';
    const shown = t > 0.5 ? pour : base;
    sws.forEach((b) => b.classList.toggle('is-on', b.dataset.coat === shown));
    return shown;
  };

  /* where the narrative is at scroll progress p */
  const narrativeAt = (p) => {
    let base = 'raw';
    let pour = POURS[0].to;
    let t = 0;
    for (const seg of POURS) {
      if (p >= seg.b) { base = seg.to; t = 0; pour = seg.to; }
      else if (p >= seg.a) {
        pour = seg.to;
        t = gsap.parseEase('power2.inOut')((p - seg.a) / (seg.b - seg.a));
        break;
      } else { pour = seg.to; break; }
    }
    /* after the last pour the wall holds the final coat */
    if (p >= POURS[POURS.length - 1].b) { base = POURS[POURS.length - 1].to; pour = base; t = 0; }
    return { base, pour, t };
  };

  let scrollP = 0;
  let override = null;     /* { key, t } — a rail pick */
  let overrideAtP = 0;     /* the scroll position it was made at */

  const render = () => {
    if (override) {
      const n = narrativeAt(scrollP);
      paint(n.t > 0.5 ? n.pour : n.base, override.key, override.t);
    } else {
      const n = narrativeAt(scrollP);
      paint(n.base, n.pour, n.t);
    }
  };

  /* ---- rail: hover or tap coats the whole stage ---- */
  const applyOverride = (key) => {
    if (reduce) {
      override = { key, t: 1 };
      render();
      return;
    }
    if (override && override.key === key) return;
    if (override) gsap.killTweensOf(override);   /* kill the OLD object's tween first */
    override = { key, t: 0 };
    overrideAtP = scrollP;
    gsap.to(override, { t: 1, duration: 0.62, ease: 'power2.inOut', onUpdate: render });
  };
  sws.forEach((b) => {
    const k = b.dataset.coat;
    b.addEventListener('pointerenter', () => { if (fine) applyOverride(k); });
    b.addEventListener('focus', () => applyOverride(k));
    b.addEventListener('click', () => applyOverride(k));
  });

  /* preload the range once the section is near — the whole set is ~430 KB */
  const warm = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) {
      warm.disconnect();
      Object.keys(COATS).forEach((k) => {
        const i = new Image(); i.src = panelUrl(k);
        const j = new Image(); j.src = panelUrl(k).replace('panel-', 'tile-');
      });
    }
  }, { rootMargin: '700px' });
  warm.observe(coatPin);

  measure();
  window.addEventListener('resize', () => { measure(); render(); });
  ScrollTrigger.addEventListener('refresh', () => { measure(); render(); });
  paint('raw', 'cedar', 0);

  if (!reduce) {
    gsap.set([spectrum, arch, closeEl], { opacity: 0 });
    gsap.set(bands, { scaleY: 0 });

    const proxy = { p: 0 };
    ScrollTrigger.create({
      trigger: coatPin,
      start: 'top top',
      end: '+=420%',
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        scrollP = p;
        /* a real scroll hands control back to the narrative — but a scrub tween
           settling, or inertial jitter, must not cancel the pick the moment it
           is made, so this needs a genuine change in position */
        if (override && Math.abs(p - overrideAtP) > 0.004) {
          gsap.killTweensOf(override);
          override = null;
        }
        render();

        /* every coat at once */
        const sp = gsap.utils.clamp(0, 1, (p - SPECTRUM.a) / (SPECTRUM.b - SPECTRUM.a));
        spectrum.style.opacity = String(sp > 0 ? 1 : 0);
        bands.forEach((b, i) => {
          const d = i / bands.length * 0.45;
          const t = gsap.utils.clamp(0, 1, (sp - d) / (1 - 0.45));
          b.style.transform = `scaleY(${gsap.parseEase('power3.out')(t).toFixed(3)})`;
        });

        /* resolve into the building */
        const ap = gsap.utils.clamp(0, 1, (p - ARCH.a) / (ARCH.b - ARCH.a));
        arch.style.opacity = String(ap > 0 ? 1 : 0);
        arch.style.clipPath = `inset(${((1 - gsap.parseEase('power2.inOut')(ap)) * 100).toFixed(2)}% 0 0 0)`;
        closeEl.style.opacity = gsap.utils.clamp(0, 1, (p - 0.9) / 0.07).toFixed(3);

        /* the panel steps forward through the pours, then hands over to the building */
        const rise = gsap.parseEase('power2.out')(gsap.utils.clamp(0, 1, p / 0.1));
        const exit = gsap.parseEase('power2.in')(gsap.utils.clamp(0, 1, (p - 0.82) / 0.14));
        gsap.set(panel, {
          yPercent: (1 - rise) * 14 + exit * 26,
          scale: 0.96 + rise * 0.04 + exit * 0.08,
          opacity: 1 - exit,
        });
        /* the copy steps aside for the closing statement */
        gsap.set([copyBase, copyPour], { opacity: 1 - gsap.utils.clamp(0, 1, (p - 0.85) / 0.07) });
      },
    });

    /* the headline sets before the scroll takes over */
    gsap.from('#copyBase > *', {
      y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: coatPin, start: 'top 72%', once: true },
    });
  }
}

/* ---------- 06 THE SPEC BENCH ---------------------------------------------
   The page's one Operate surface. Three choices drive a live NBS clause; every
   line that changes flashes, so the document visibly rewrites rather than
   silently swapping. Two actions: copy the clause, or have the drawing files
   issued against exactly this specification.
   The clause text is a DRAFT and says so — swap CLAUSE() for Vulcan's real
   wording when it is supplied. Evidence documents belong to 03, not here.
   ------------------------------------------------------------------------- */
const SB_PROFILE = {
  tg125: { name: 'TG125',      cover: '125mm', coverN: '125mm effective cover' },
  tg150: { name: 'T&G150',     cover: '150mm', coverN: '150mm effective cover' },
  s400:  { name: '400 Series', cover: 'To layout', coverN: 'wide-format cover, to the project layout' },
};
const SB_ORIENT = {
  horizontal: { rail: 'Vertical cladding rails at 600mm c/c on helping-hand brackets',
                text: 'Horizontal courses on vertical rails' },
  vertical:   { rail: 'Horizontal cladding rails at 600mm c/c on helping-hand brackets',
                text: 'Vertical boards on horizontal rails' },
};
const SB_FINISH = {
  wood:  { label: 'Wood-effect', fire: 'A2-s1,d0',
           text: 'Wood-grain polyester powder coat, Qualicoat approved — 11 timber looks' },
  ral:   { label: 'RAL colour', fire: 'A2-s1,d0',
           text: 'Polyester powder coat to any RAL colour, Qualicoat approved' },
  anod:  { label: 'Anodised', fire: 'A1',
           text: 'Anodised aluminium, silver or bronze — non-combustible' },
  stone: { label: 'Stone effect', fire: 'A2-s1,d0',
           text: 'Stone-effect coat to order — minimum quantities apply' },
};

const sbControls = document.getElementById('sbControls');
if (sbControls) {
  const clause = document.getElementById('sbClause');
  const dataEls = gsap.utils.toArray('#sbData [data-d]');
  const copyBtn = document.getElementById('sbCopy');
  const filesBtn = document.getElementById('sbFiles');
  const vals = new Map(gsap.utils.toArray('#sbClause [data-val]').map((el) => [el.dataset.val, el]));

  const read = () => ({
    p: SB_PROFILE[sbControls.profile.value],
    o: SB_ORIENT[sbControls.orient.value],
    f: SB_FINISH[sbControls.finish.value],
  });

  const CLAUSE = ({ p, o, f }) => ({
    system:  `VulcaLap® ${p.name} aluminium plank rainscreen cladding`,
    maker:   'Vulcan Cladding Systems — sales@vulcansystems.co.uk — 020 8681 0617',
    profile: `Single aluminium extrusion, ${p.coverN} — no core, no laminate`,
    orient:  o.text,
    fire:    `Classified ${f.fire} to BS EN 13501-1 (system classification, as tested)`,
    finish:  f.text,
    durab:   'ISO 12944-6:2018, C4 environments, 25 years — 10-year manufacturer warranty',
    fixing:  'Concealed fixings throughout, with aluminium trims in a matching finish',
    support: `${o.rail}; Vulcan 25mm ZED section`,
    lengths: "Cut to the project's setting-out",
  });

  let first = true;
  const render = () => {
    const state = read();
    const next = CLAUSE(state);
    Object.entries(next).forEach(([k, text]) => {
      const el = vals.get(k);
      if (!el || el.textContent === text) return;
      el.textContent = text;
      if (first || reduce) return;
      /* flash only the lines that actually changed — the document is live */
      const line = el.closest('.sb-line');
      line.classList.remove('changed');
      void line.offsetWidth;               /* restart the animation */
      line.classList.add('changed');
    });

    const derived = {
      cover: state.p.cover,
      rails: '600mm c/c',
      cavity: '25mm',
      fire: state.f.fire,
    };
    dataEls.forEach((el) => {
      const v = derived[el.dataset.d];
      if (v !== undefined && el.textContent !== v) el.textContent = v;
    });
    first = false;
  };

  sbControls.addEventListener('change', render);
  render();

  const asText = () => {
    const { p } = read();
    const rows = [...clause.querySelectorAll('.sb-line')].map((l) =>
      `${l.querySelector('dt').textContent}: ${l.querySelector('dd').textContent}`);
    return [
      'NBS SOURCE CLAUSE (DRAFT - confirm the project clause with Vulcan before issue)',
      `VulcaLap ${p.name}`, '', ...rows,
    ].join('\n');
  };

  const idle = copyBtn.textContent;
  copyBtn.addEventListener('click', async () => {
    if (copyBtn.classList.contains('is-copied')) return;
    const text = asText();
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      /* clipboard can be blocked (permissions / insecure context) */
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    copyBtn.textContent = 'Clause copied';
    copyBtn.classList.add('is-copied');
    (window.dataLayer = window.dataLayer || []).push({ event: 'nbs_clause_copy', system: read().p.name });
    setTimeout(() => {
      copyBtn.textContent = idle;
      copyBtn.classList.remove('is-copied');
    }, 2200);
  });

  filesBtn.addEventListener('click', () => {
    const { p, o, f } = read();
    const subject = encodeURIComponent(`Drawing files: VulcaLap ${p.name}`);
    const body = encodeURIComponent(
      `Please send the CAD details, Revit family and typical drawings for:\n\n` +
      `Profile: VulcaLap ${p.name} (${p.coverN})\nOrientation: ${o.text}\nFinish: ${f.label}\n\n` +
      'Project:\nName:\nContact number:\n');
    (window.dataLayer = window.dataLayer || []).push({
      event: 'drawing_files_request', profile: p.name, orientation: o.text, finish: f.label,
    });
    window.location.href = `mailto:sales@vulcansystems.co.uk?subject=${subject}&body=${body}`;
  });
}

/* ---------- Contact finale: "the facade answers" wall (ported from the homepage) ---------- */
const wallCanvas = document.querySelector('.contact-wall');
if (wallCanvas) {
  const wctx = wallCanvas.getContext('2d');
  const wallStage = wallCanvas.closest('.contact-stage');
  const wallCta = wallStage.querySelector('.btn');
  const COURSE = 46;
  let W = 0;
  let H = 0;
  let planks = [];

  const light = { x: 0.5, y: 1.2, tx: 0.5, ty: 0.55, pointer: false, focus: 0, focusT: 0 };

  const mixc = (a, b, t) => a + (b - a) * t;
  const plankColor = (I) => {
    let r, g, b;
    if (I < 0.72) {
      const t = I / 0.72;
      r = mixc(4, 0, t); g = mixc(38, 87, t); b = mixc(61, 150, t);
    } else {
      const t = (I - 0.72) / 0.28;
      r = mixc(0, 84, t); g = mixc(87, 118, t); b = mixc(150, 186, t);
    }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  };

  const drawWall = (settle) => {
    const lx = light.x * W;
    const ly = light.y * H;
    const sigX = W * (0.21 - light.focusT * 0.07);
    const sigY = H * (0.24 - light.focusT * 0.07);
    planks.forEach((p) => {
      const cy = p.y + p.h / 2;
      const fy = Math.exp(-(((cy - ly) / sigY) ** 2) / 2);
      p.lit = settle ? fy : p.lit + (fy - p.lit) * 0.16;
      const grad = wctx.createLinearGradient(0, 0, W, 0);
      const lip = wctx.createLinearGradient(0, 0, W, 0);
      for (let s = 0; s <= 8; s++) {
        const fx = Math.exp(-((((s / 8) * W - lx) / sigX) ** 2) / 2);
        const I = Math.min(0.88, p.lit * fx * (0.95 + light.focusT * 0.25));
        grad.addColorStop(s / 8, plankColor(I));
        lip.addColorStop(s / 8, `rgba(167,172,216,${(I * 0.6).toFixed(3)})`);
      }
      wctx.fillStyle = grad;
      wctx.fillRect(0, p.y, W, p.h + 1);
      wctx.fillStyle = lip;
      wctx.fillRect(0, p.y, W, 1.25);
      wctx.fillStyle = 'rgba(1, 16, 27, 0.5)';
      wctx.fillRect(0, p.y + p.h - 1, W, 1);
      wctx.fillStyle = `rgba(1, 16, 27, ${(0.1 + p.lit * 0.18).toFixed(3)})`;
      wctx.fillRect(p.joint * W, p.y, 1, p.h);
    });
  };

  const wallLayout = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = wallStage.clientWidth;
    H = wallStage.clientHeight;
    wallCanvas.width = Math.round(W * dpr);
    wallCanvas.height = Math.round(H * dpr);
    wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(10, Math.round(H / COURSE));
    planks = Array.from({ length: n }, (_, i) => ({
      y: (i * H) / n,
      h: H / n,
      lit: 0,
      joint: (i * 0.618034 + 0.23) % 1,
    }));
    if (reduce) { light.x = 0.5; light.y = 0.58; drawWall(true); }
  };
  wallLayout();
  window.addEventListener('resize', wallLayout);

  window.__wall = { render: (x = 0.5, y = 0.55) => { light.x = x; light.y = y; drawWall(true); } };

  if (!reduce) {
    if (fine) {
      wallStage.addEventListener('pointermove', (e) => {
        const r = wallStage.getBoundingClientRect();
        light.pointer = true;
        light.tx = (e.clientX - r.left) / r.width;
        light.ty = (e.clientY - r.top) / r.height;
      });
      wallStage.addEventListener('pointerleave', () => { light.pointer = false; });
      if (wallCta) {
        wallCta.addEventListener('pointerenter', () => { light.focus = 1; });
        wallCta.addEventListener('pointerleave', () => { light.focus = 0; });
      }
    }
    let wallVisible = false;
    let sweep = -1;
    const wio = new IntersectionObserver((es) => {
      const vis = es.some((e) => e.isIntersecting);
      if (vis && !wallVisible && sweep < 0) sweep = 0;
      wallVisible = vis;
    }, { threshold: 0.2 });
    wio.observe(wallStage);
    gsap.ticker.add((t, dtMs) => {
      if (!wallVisible) return;
      const dt = Math.min(dtMs, 100) / 1000;
      if (sweep >= 0 && sweep < 1) {
        sweep = Math.min(1, sweep + dt / 1.8);
        light.tx = -0.25 + sweep * 1.5;
        light.ty = 0.5;
      } else if (!light.pointer) {
        light.tx = 0.5 + 0.42 * Math.sin(t * 0.21);
        light.ty = 0.52 + 0.3 * Math.sin(t * 0.14 + 2);
      }
      if (light.focus && wallCta) {
        const r = wallCta.getBoundingClientRect();
        const s = wallStage.getBoundingClientRect();
        light.tx = (r.left + r.width / 2 - s.left) / s.width;
        light.ty = (r.top + r.height / 2 - s.top) / s.height;
      }
      light.focusT += (light.focus - light.focusT) * 0.1;
      light.x += (light.tx - light.x) * 0.085;
      light.y += (light.ty - light.y) * 0.085;
      drawWall(false);
    });
  }
}

/* ---------- Magnetic primary CTAs (desktop, motion allowed) ---------- */
if (!reduce && fine) {
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    const qx = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
    const qy = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * 0.28);
      qy((e.clientY - r.top - r.height / 2) * 0.34);
    });
    btn.addEventListener('pointerleave', () => {
      qx(0);
      qy(0);
    });
  });
}

/* ---------- Footer: staggered entrance + the final course ---------- */
if (!reduce) {
  gsap.from('.footer-grid > *', {
    y: 34, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09,
    scrollTrigger: { trigger: '.footer', start: 'top 80%', once: true },
  });
  gsap.from('.footer-course span', {
    scaleX: 0, duration: 0.85, ease: 'power4.inOut', stagger: 0.11,
    scrollTrigger: { trigger: '.footer-legal', start: 'top 96%', once: true },
  });
}
document.querySelector('.footer-up').addEventListener('click', () => scrollToPos(0));

/* ---------- SAMPLE REQUEST DIALOG -----------------------------------------
   Fields mirror Vulcan's live Gravity Form (#9), including which ones they
   mark required. Two steps so the lead itself lands before the long project
   section, and step one fires a partial-lead event on advance so a drop-off
   still reaches the CRM.
   BACKEND PENDING: point RQ_ENDPOINT at the Pipedrive-backed handler at dev
   stage; until then the enquiry is composed as a mailto so nothing is lost.
   ------------------------------------------------------------------------- */
const RQ_ENDPOINT = null;

const rq = document.getElementById('rqDialog');
if (rq) {
  const form = document.getElementById('rqForm');
  const steps = gsap.utils.toArray('.rq-step', rq);
  const progs = gsap.utils.toArray('.rq-prog-step', rq);
  const backBtn = document.getElementById('rqBack');
  const nextBtn = document.getElementById('rqNext');
  const submitBtn = document.getElementById('rqSubmit');
  const noteEl = document.getElementById('rqNote');
  const topErr = document.getElementById('rqTop');
  const doneEl = document.getElementById('rqDone');
  const sampleSel = document.getElementById('rqSample');
  let step = 1;
  let opener = null;

  /* ---- validation ---- */
  const fieldOf = (el) => el.closest('.rq-field') || el.closest('.rq-set');
  const setMsg = (el, msg) => {
    const wrap = fieldOf(el);
    if (!wrap) return;
    wrap.classList.toggle('is-bad', Boolean(msg));
    const slot = wrap.querySelector('.rq-msg');
    if (slot) slot.textContent = msg || '';
  };
  const labelFor = (el) => {
    const l = form.querySelector(`label[for="${el.id}"]`);
    return (l ? l.childNodes[0].textContent : el.name).trim().replace(/\s*\*$/, '');
  };
  const problem = (el) => {
    if (el.validity.valid) return '';
    if (el.validity.valueMissing) return `${labelFor(el)} is needed.`;
    if (el.validity.typeMismatch && el.type === 'email') return 'That email address does not look right.';
    return `Check ${labelFor(el).toLowerCase()}.`;
  };
  const groupOk = (name) => {
    const set = form.querySelector(`.rq-set[data-group="${name}"]`);
    if (!set) return true;
    const any = [...set.querySelectorAll('input[type="checkbox"]')].some((c) => c.checked);
    set.classList.toggle('is-bad', !any);
    const slot = set.querySelector('.rq-msg');
    if (slot) slot.textContent = any ? '' : 'Pick at least one.';
    return any;
  };

  const validate = (n) => {
    const scope = steps[n - 1];
    let firstBad = null;
    let ok = true;
    scope.querySelectorAll('input, select, textarea').forEach((el) => {
      if (el.type === 'checkbox' || el.disabled || el.closest('[hidden]')) return;
      const msg = problem(el);
      setMsg(el, msg);
      if (msg) { ok = false; firstBad = firstBad || el; }
    });
    if (n === 2) {
      ['type', 'size'].forEach((g) => {
        if (!groupOk(g)) {
          ok = false;
          firstBad = firstBad || form.querySelector(`.rq-set[data-group="${g}"] input`);
        }
      });
    }
    topErr.hidden = ok;
    if (!ok) {
      topErr.textContent = 'A few details are still needed below.';
      firstBad && firstBad.focus();
    }
    return ok;
  };

  /* clear a field's error as soon as it becomes valid */
  form.addEventListener('input', (e) => {
    const el = e.target;
    if (el.type === 'checkbox') {
      const set = el.closest('.rq-set[data-group]');
      if (set) groupOk(set.dataset.group);
    } else if (fieldOf(el)?.classList.contains('is-bad') && el.validity.valid) {
      setMsg(el, '');
    }
  });

  /* the two "Please specify" fields only exist when they are relevant */
  const conditional = (triggerSel, wrapId, on) => {
    const wrap = document.getElementById(wrapId);
    const sync = () => {
      const show = on();
      wrap.hidden = !show;
      if (!show) wrap.querySelector('input').value = '';
    };
    form.querySelectorAll(triggerSel).forEach((el) => el.addEventListener('change', sync));
    sync();
  };
  conditional('input[name="type"]', 'rqTypeOtherWrap',
    () => form.querySelector('input[name="type"][value="Other"]').checked);
  conditional('#rqHeard', 'rqHeardOtherWrap',
    () => document.getElementById('rqHeard').value === 'Other');

  /* ---- steps ---- */
  const show = (n) => {
    step = n;
    steps.forEach((el, i) => el.classList.toggle('is-on', i === n - 1));
    progs.forEach((el, i) => el.classList.toggle('is-on', i <= n - 1));
    backBtn.hidden = n === 1;
    nextBtn.hidden = n === 2;
    submitBtn.hidden = n === 1;
    noteEl.textContent = `Step ${n} of 2`;
    topErr.hidden = true;
    form.scrollTop = 0;
    const focusable = steps[n - 1].querySelector('input, select, textarea');
    focusable && focusable.focus({ preventScroll: true });
  };

  nextBtn.addEventListener('click', () => {
    if (!validate(1)) return;
    /* the lead is captured here, so a drop-off on step 2 is still a lead */
    (window.dataLayer = window.dataLayer || []).push({
      event: 'sample_request_lead',
      name: `${form.first.value} ${form.last.value}`.trim(),
      phone: form.phone.value, email: form.email.value, samples: form.samples.value,
    });
    show(2);
  });
  backBtn.addEventListener('click', () => show(1));

  /* ---- open / close ---- */
  const openRq = (from) => {
    opener = from || null;
    /* start from whatever the page is already showing */
    const prof = document.querySelector('input[name="profile"]:checked');
    const fin = document.querySelector('input[name="finish"]:checked');
    if (prof && fin) {
      const shape = prof.value === 'tg125' || prof.value === 'tg150' ? 'T&G' : 'Shiplap';
      const coat = fin.value === 'ral' ? 'RAL' : 'WOOD';
      const want = `${shape} in ${coat} finish`;
      const match = [...sampleSel.options].find((o) => o.value === want);
      if (match) sampleSel.value = want;
    }
    doneEl.hidden = true;
    form.hidden = false;
    show(1);
    rq.showModal();
    if (lenis) lenis.stop();
  };
  const closeRq = () => rq.close();

  document.querySelectorAll('[data-enquire]').forEach((btn) => {
    btn.addEventListener('click', () => openRq(btn));
  });
  document.getElementById('rqClose').addEventListener('click', closeRq);
  document.getElementById('rqDoneClose').addEventListener('click', closeRq);
  /* clicking the backdrop closes, clicking the panel does not */
  rq.addEventListener('click', (e) => { if (e.target === rq) closeRq(); });
  rq.addEventListener('close', () => {
    if (lenis) lenis.start();
    opener && opener.focus();
  });

  /* ---- submit ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(2)) return;
    const d = Object.fromEntries(new FormData(form).entries());
    d.type = [...form.querySelectorAll('input[name="type"]:checked')].map((c) => c.value).join(', ');
    d.size = [...form.querySelectorAll('input[name="size"]:checked')].map((c) => c.value).join(', ');

    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = 'Sending…';
    (window.dataLayer = window.dataLayer || []).push({ event: 'sample_request_submit', samples: d.samples });

    let sent = false;
    if (RQ_ENDPOINT) {
      try {
        const res = await fetch(RQ_ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d),
        });
        sent = res.ok;
      } catch (_) { sent = false; }
    }

    if (!sent) {
      /* no handler wired yet — hand the enquiry to mail rather than lose it */
      const lines = [
        `Samples: ${d.samples}`, `Name: ${d.first} ${d.last}`, `Phone: ${d.phone}`, `Email: ${d.email}`,
        `Company: ${d.company || '-'}`, `Project reference: ${d.reference}`,
        `Address: ${[d.street, d.town, d.county, d.postcode].filter(Boolean).join(', ')}, United Kingdom`,
        `Project type: ${d.type}${d.typeOther ? ` (${d.typeOther})` : ''}`,
        `Project size: ${d.size}`, `Start date: ${d.start}`,
        `Heard about us: ${d.heard || '-'}${d.heardOther ? ` (${d.heardOther})` : ''}`,
        '', 'Further information:', d.more || '-',
      ];
      window.location.href = 'mailto:sales@vulcansystems.co.uk?subject=' +
        encodeURIComponent(`Sample request: ${d.samples} — ${d.reference}`) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    }

    submitBtn.removeAttribute('aria-busy');
    submitBtn.textContent = 'Send request';
    document.getElementById('rqDoneLine').textContent = sent
      ? 'We will be in touch, and your samples go out with the datasheet and the fire classification.'
      : 'Your email app has the request ready to send. Once it is away we will be in touch.';
    form.hidden = true;
    doneEl.hidden = false;
    document.getElementById('rqDoneClose').focus();
  });
}

/* ---------- Footer clock + year ---------- */
const timeEl = document.getElementById('footer-time');
const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
const tickClock = () => (timeEl.textContent = timeFmt.format(new Date()));
tickClock();
setInterval(tickClock, 30000);
document.getElementById('year').textContent = new Date().getFullYear();
