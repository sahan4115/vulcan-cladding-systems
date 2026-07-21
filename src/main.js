import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import './styles.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

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

/* ---------- Preloader: bars fix into place, wall lifts, hero enters ---------- */
const preloader = document.querySelector('.preloader');
const heroVideo = document.querySelector('.hero-media-el');
if (reduce && heroVideo) heroVideo.pause();

/* wrap each word so letters never break mid-word, chars still animate individually */
const spanify = (text) =>
  text
    .split(/(\s+)/)
    .map((tok) =>
      /^\s+$/.test(tok)
        ? ' '
        : `<span class="word">${[...tok].map((ch) => `<span class="ch">${ch}</span>`).join('')}</span>`
    )
    .join('');

/* split a masked headline into characters (screen readers get the aria-label) */
const splitTitle = (title) => {
  if (!title || title.dataset.split) return;
  title.dataset.split = '1';
  title.setAttribute('aria-label', title.textContent.trim().replace(/\s+/g, ' '));
  title.querySelectorAll('.line-inner').forEach((inner) => {
    inner.setAttribute('aria-hidden', 'true');
    inner.innerHTML = [...inner.childNodes]
      .map((n) => (n.nodeType === 3 ? spanify(n.textContent) : `<strong>${spanify(n.textContent)}</strong>`))
      .join('');
  });
};

const heroTitle = document.querySelector('.hero-title');
if (!reduce) splitTitle(heroTitle);

const heroIntro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
heroIntro
  .from('.hero-title .ch', { yPercent: 120, duration: 0.85, stagger: 0.014, ease: 'power4.out' }, 0)
  .add(() => heroTitle.classList.add('filled'), 0.95)
  .from('.hero-side > *', { y: 26, opacity: 0, duration: 0.8, stagger: 0.12 }, 0.55)
  .from('.hero-stamp', { scale: 0.6, opacity: 0, duration: 0.9, ease: 'back.out(1.5)' }, 0.85)
  .fromTo('.hero-media-el', { scale: 1.12 }, { scale: 1.02, duration: 2.2, ease: 'power2.out' }, 0);

const finishPre = () => {
  preloader.classList.add('done');
  if (lenis) lenis.start();
};

if (reduce) {
  finishPre();
  gsap.set(['.hero-title .line-inner', '.hero-side > *', '.hero-stamp'], { clearProps: 'all' });
  heroTitle.classList.add('filled');
} else {
  if (lenis) lenis.stop();
  const pre = gsap.timeline({
    onComplete: () => {
      finishPre();
      heroIntro.play();
    },
  });
  pre
    .to('.pre-bar', { scaleX: 1, duration: 0.5, stagger: 0.12, ease: 'power3.inOut' })
    .to('.pre-logo', { opacity: 1, duration: 0.4 }, '-=0.3')
    .to('.pre-core', { opacity: 0, duration: 0.35, delay: 0.4 })
    /* the wall strips away plank by plank */
    .to('.pre-slats span', {
      xPercent: (i) => (i % 2 ? 102 : -102),
      duration: 0.75,
      stagger: 0.07,
      ease: 'power4.inOut',
    }, '-=0.1');
  /* failsafe: never trap the page behind the preloader */
  setTimeout(() => {
    if (!preloader.classList.contains('done')) {
      pre.progress(1);
    }
  }, 4500);
}

/* ---------- Nav: solid after hero, hides down / shows up ---------- */
const nav = document.querySelector('.nav');
const mm = gsap.matchMedia();
const navSolid = (on) => nav.classList.toggle('scrolled', on);
/* desktop+motion: the hero pin drives nav state (see hero timeline below); otherwise at 30px */
mm.add('(max-width: 860px), (prefers-reduced-motion: reduce)', () => {
  const st = ScrollTrigger.create({
    start: 30,
    end: 'max',
    onUpdate: (self) => navSolid(self.scroll() > 30),
  });
  navSolid(window.scrollY > 30);
  return () => {
    st.kill();
    navSolid(false);
  };
});
if (!reduce) {
  const navTween = gsap.quickTo(nav, 'yPercent', { duration: 0.45, ease: 'power3.out' });
  ScrollTrigger.create({
    start: 'top top',
    onUpdate: (self) => {
      if (self.scroll() < 120 || self.direction === -1) navTween(0);
      else if (!nav.classList.contains('menu-open')) navTween(-100);
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
  nav.classList.add('scrolled');
  gsap.set(nav, { yPercent: 0 });
  burger.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  if (lenis) open ? lenis.stop() : lenis.start();
});

/* ---------- Nav dropdowns (Products, Colours — hover via CSS; click for touch) ---------- */
const drops = [...document.querySelectorAll('.nav-drop')];
const setDrop = (drop, open) => {
  drop.classList.toggle('open', open);
  drop.querySelector('.nav-drop-btn').setAttribute('aria-expanded', String(open));
};
drops.forEach((drop) => {
  const dropBtn = drop.querySelector('.nav-drop-btn');
  dropBtn.addEventListener('click', () => {
    const open = !drop.classList.contains('open');
    // opening one closes the others
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

/* ---------- Hero mouse parallax (desktop, motion allowed) ---------- */
if (!reduce && fine) {
  const qx = gsap.quickTo(heroVideo, 'x', { duration: 0.9, ease: 'power3.out' });
  const qy = gsap.quickTo(heroVideo, 'y', { duration: 0.9, ease: 'power3.out' });
  document.querySelector('.hero').addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    qx(nx * -18);
    qy(ny * -12);
  });
}

/* ---------- Hero: media wedge expands to full bleed, second beat reveals (desktop) ---------- */
mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
  document.body.classList.add('hero-a');
  /* clip geometry lives in CSS (driven by --clip-p); 0 = split state, 1 = full bleed */
  gsap.set('.hero-media', { '--clip-p': 0 });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '+=130%',
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        document.body.classList.toggle('hero-a', self.progress < 0.45);
        navSolid(self.progress >= 1);
      },
      onLeave: () => navSolid(true),
      onEnterBack: () => navSolid(false),
    },
  });
  tl.to('.hero-media', { '--clip-p': 1, duration: 0.5, ease: 'power2.inOut' }, 0)
    .to('.hero-content', { x: -90, opacity: 0, duration: 0.35, ease: 'power1.in' }, 0.02)
    /* fromTo: explicit start so a mid-page reload can't lock these at the intro's opacity 0 */
    .fromTo('.hero-stamp', { opacity: 1 }, { opacity: 0, duration: 0.25, ease: 'power1.in' }, 0.02)
    .to('.hero-scrim', { opacity: 1, duration: 0.35, ease: 'none' }, 0.2)
    .to('.hero-reveal', { opacity: 1, duration: 0.2, ease: 'none' }, 0.52)
    .from('.hero-reveal .line-inner', { yPercent: 112, duration: 0.3, stagger: 0.09, ease: 'power2.out' }, 0.55);
  return () => {
    document.body.classList.remove('hero-a');
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
    gsap.set(['.hero-media', '.hero-content', '.hero-stamp', '.hero-scrim', '.hero-reveal', '.hero-reveal .line-inner'], { clearProps: 'all' });
  };
});

/* ---------- Hero exits with depth as the story starts (mobile) ---------- */
mm.add('(max-width: 860px) and (prefers-reduced-motion: no-preference)', () => {
  const t = gsap.to('.hero-content', {
    yPercent: -16,
    opacity: 0.15,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 30%', scrub: true },
  });
  return () => {
    if (t.scrollTrigger) t.scrollTrigger.kill();
    t.kill();
    gsap.set('.hero-content', { clearProps: 'all' });
  };
});

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

/* ---------- Section reveals + image treatments ---------- */
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

/* ---------- Systems: horizontal pan (desktop, motion allowed) ---------- */
mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
  const track = document.querySelector('.hpan-track');
  const bar = document.querySelector('.hpan-progress span');
  const dist = () => track.scrollWidth - window.innerWidth;
  const tween = gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.hpan',
      start: 'top top',
      end: () => `+=${dist()}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    },
  });
  return () => {
    tween.scrollTrigger && tween.scrollTrigger.kill();
    tween.kill();
    gsap.set(track, { clearProps: 'x' });
    gsap.set(bar, { clearProps: 'transform' });
  };
});

/* ---------- Steps: why Vulcan on a rotating dial (pinned, scrub + drag) ---------- */
const stepsSec = document.querySelector('.steps');
const dialStage = document.getElementById('dialStage');
if (!reduce && stepsSec && dialStage) {
  stepsSec.classList.add('dial-mode');
  const dialEl = document.getElementById('dial');
  const ticksWrap = document.getElementById('dialTicks');
  const dcards = gsap.utils.toArray('.dcard');
  const dialNum = document.getElementById('dialNum');

  /* the tick gauge: a wide arc of plank marks, majors every fifth */
  const tickEls = [];
  const tickAngles = [];
  for (let a = -66; a <= 66; a += 1.65) {
    const tk = document.createElement('span');
    tk.className = 'dial-tick' + (tickEls.length % 5 === 0 ? ' major' : '');
    ticksWrap.appendChild(tk);
    tickEls.push(tk);
    tickAngles.push(a);
  }

  /* cards ride a level horizontal track (upright, equal heights);
     only the tick gauge below them rotates as the dial */
  let R, Rtick, stepDeg, cardSpacing, cardY;
  const rot = { r: 0 };
  let active = -1;
  const applyDial = () => {
    dialEl.style.transform = `rotate(${rot.r}deg)`;
    const prog = -rot.r / stepDeg; /* 0 .. n-1 */
    const act = Math.max(0, Math.min(dcards.length - 1, Math.round(prog)));
    if (act !== active) {
      active = act;
      dialNum.textContent = `0${act + 1}`;
    }
    dcards.forEach((c, i) => {
      const d = i - prog;
      const s = Math.max(0.74, 1 - Math.abs(d) * 0.2);
      c.style.transform = `translate(-50%,0) translateX(${d * cardSpacing}px) scale(${s})`;
      c.classList.toggle('on', i === act);
    });
    tickEls.forEach((t, i) => t.classList.toggle('fill', tickAngles[i] + rot.r <= 0.01));
  };
  const dialLayout = () => {
    const mob = innerWidth < 700;
    R = mob ? Math.max(560, innerWidth * 1.45) : Math.min(1100, Math.max(820, innerWidth * 0.78));
    Rtick = R - (mob ? 115 : 140);
    stepDeg = mob ? 22 : 21; /* 4 cards: keep rotation (stepDeg * 3) within the ±66° tick arc */
    cardSpacing = mob ? dialStage.offsetWidth * 0.86 : Math.min(540, dialStage.offsetWidth * 0.42);
    cardY = Math.round(dialStage.offsetHeight * 0.05);
    dialEl.style.top = `${dialStage.offsetHeight * 0.44 + R}px`;
    tickEls.forEach((t, i) => {
      t.style.transform = `rotate(${tickAngles[i]}deg) translateY(${-Rtick}px)`;
    });
    dcards.forEach((c) => {
      c.style.left = '50%';
      c.style.top = `${cardY}px`;
    });
    applyDial();
  };
  dialLayout();

  const dialTl = gsap.timeline({
    scrollTrigger: {
      trigger: stepsSec,
      start: 'top top',
      end: '+=220%',
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      snap: {
        snapTo: dcards.map((_, i) => i / (dcards.length - 1)),
        duration: { min: 0.25, max: 0.7 },
        ease: 'power2.out',
        delay: 0.1,
      },
    },
  });
  dialTl.to(rot, { r: () => -stepDeg * (dcards.length - 1), ease: 'none', onUpdate: applyDial });
  ScrollTrigger.addEventListener('refreshInit', dialLayout);

  /* drag to rotate: horizontal drag maps onto the pinned scroll span */
  let dragging = false;
  let dragX = 0;
  let dragScroll = 0;
  let dragMoved = 0;
  dialStage.addEventListener('pointerdown', (e) => {
    dragging = true;
    dragMoved = 0;
    dragX = e.clientX;
    dragScroll = window.scrollY;
    dialStage.classList.add('dragging');
    try { dialStage.setPointerCapture(e.pointerId); } catch (_) { /* no-op */ }
  });
  dialStage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragX;
    dragMoved = Math.max(dragMoved, Math.abs(dx));
    const st = dialTl.scrollTrigger;
    const span = st.end - st.start;
    const y = Math.max(st.start, Math.min(st.end, dragScroll - dx * (span / (innerWidth * 0.85))));
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  });
  ['pointerup', 'pointercancel'].forEach((ev) =>
    dialStage.addEventListener(ev, () => {
      dragging = false;
      dialStage.classList.remove('dragging');
    })
  );

  /* click an inactive step to travel to it */
  dcards.forEach((c, i) => {
    c.addEventListener('click', () => {
      if (dragMoved > 8 || i === active) return;
      const st = dialTl.scrollTrigger;
      const y = st.start + (i / (dcards.length - 1)) * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { duration: 1.1 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}

/* ---------- Contact: "the facade answers" — plank wall lit by the cursor ----------
   The canvas draws horizontal cladding courses; one virtual light rakes across them
   (the cursor on fine pointers, a slow ambient drift otherwise), catching each course's
   top lip. Hovering the CTA pulls the light onto the button so the wall focuses the eye. */
const wallCanvas = document.querySelector('.contact-wall');
if (wallCanvas) {
  const wctx = wallCanvas.getContext('2d');
  const wallStage = wallCanvas.closest('.contact-stage');
  const wallCta = wallStage.querySelector('.btn');
  const COURSE = 46; /* target cladding course height, CSS px */
  let W = 0;
  let H = 0;
  let planks = [];

  /* x/y are 0..1 of the stage; focus (0/1) tightens the pool onto the CTA on hover */
  const light = { x: 0.5, y: 1.2, tx: 0.5, ty: 0.55, pointer: false, focus: 0, focusT: 0 };

  const mixc = (a, b, t) => a + (b - a) * t;
  /* intensity ramp: navy base → brand blue → a breath of lblue at the peak */
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
      p.lit = settle ? fy : p.lit + (fy - p.lit) * 0.16; /* trails a beat — feels physical */
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
      /* shiplap detail: top lip catches the light, under-shadow reads as the seam */
      wctx.fillStyle = lip;
      wctx.fillRect(0, p.y, W, 1.25);
      wctx.fillStyle = 'rgba(1, 16, 27, 0.5)';
      wctx.fillRect(0, p.y + p.h - 1, W, 1);
      /* one staggered vertical joint per course (running bond), barely-there */
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
      /* golden-ratio scatter keeps the joints non-repeating */
      joint: (i * 0.618034 + 0.23) % 1,
    }));
    /* reduced motion: one static render, pool settled behind the CTA */
    if (reduce) { light.x = 0.5; light.y = 0.58; drawWall(true); }
  };
  wallLayout();
  window.addEventListener('resize', wallLayout);

  /* QA hook: hidden preview panels never fire rAF, so screenshots need a manual frame.
     Renders the wall settled, with the light at (x, y) in 0..1 stage coords. */
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
    /* run only while on screen; one intro sweep across the facade on first arrival */
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
        /* ambient drift: slow lissajous so the wall never sits still */
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

/* ---------- Case studies: pinned horizontal scroll ----------
   Desktop + motion: pin the section for one viewport and scrub the track right→left
   as the page scrolls, revealing all cards. Touch / reduced-motion keep the CSS
   native swipe row (no pin), so the cards are always reachable. */
const projSec = document.querySelector('.projects');
if (projSec) {
  const pinEl = projSec.querySelector('.projects-pin');
  const viewport = projSec.querySelector('.projects-viewport');
  const track = projSec.querySelector('.projects-track');
  // travel = how far the track overruns the viewport; measured, not from 100vw (scrollbar-safe)
  const travel = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    projSec.classList.add('is-pinned'); // switch to the fixed-height pinned layout before measuring
    const tween = gsap.to(track, {
      x: () => -travel(),
      ease: 'none',
      scrollTrigger: {
        trigger: pinEl,
        start: 'top top',
        end: () => '+=' + travel(),
        pin: pinEl,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    return () => {
      projSec.classList.remove('is-pinned');
      tween.scrollTrigger && tween.scrollTrigger.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'transform' });
    };
  });
}

/* ---------- Finishes: diagonal wipe swatcher ---------- */
const wood = document.querySelector('.finish-wood');
const woodTint = document.querySelector('.finish-wood-tint');
const wipe = document.querySelector('.finish-wipe');
/* Only the wood planks recolour (the .finish-wood layer); the rest of the cutaway stays put.
   cedar/oak/anthracite via a filter on the planks; RAL via a colour multiplied onto the
   grayscale planks through the wood-shaped mask. */
const FINISHES = {
  cedar:      { filter: 'none',                                           tint: 'transparent' },
  oak:        { filter: 'brightness(0.72) saturate(1.15) contrast(1.05)', tint: 'transparent' },
  anthracite: { filter: 'grayscale(1) brightness(0.6) contrast(1.05)',    tint: 'transparent' },
  ral:        { filter: 'grayscale(1) brightness(1.12) contrast(0.95)',   tint: 'rgba(0, 87, 150, 0.85)' },
};
let wiping = false;
const applyFinish = (key) => {
  const f = FINISHES[key];
  wood.style.filter = f.filter;
  woodTint.style.backgroundColor = f.tint;
};
document.querySelectorAll('.finish-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    if (chip.classList.contains('is-active') || wiping) return;
    document.querySelectorAll('.finish-chip').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    if (reduce) {
      applyFinish(chip.dataset.finish);
      return;
    }
    wiping = true;
    gsap.timeline({ onComplete: () => (wiping = false) })
      .fromTo(wipe, { xPercent: -125 }, { xPercent: 0, duration: 0.5, ease: 'power3.in' })
      .add(() => applyFinish(chip.dataset.finish))
      .to(wipe, { xPercent: 125, duration: 0.55, ease: 'power3.out' })
      .set(wipe, { xPercent: -125 });
  });
});

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

/* ---------- 3D plank (lazy) + profile explorer ---------- */
const plankStage = document.querySelector('.plank-stage');
if (plankStage) {
  let plankApi = null;
  const plankTabs = gsap.utils.toArray('.plank-tab');
  const activeProfile = () => document.querySelector('.plank-tab.is-active').dataset.profile;
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        import('./plank.js').then(({ initPlank }) => {
          plankApi = initPlank(document.getElementById('plank-canvas'), { reduce, profile: activeProfile() });
        });
      }
    },
    { rootMargin: '400px' }
  );
  io.observe(plankStage);
  plankTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('is-active')) return;
      plankTabs.forEach((t) => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-pressed', String(t === tab));
      });
      if (plankApi) plankApi.setProfile(tab.dataset.profile);
    });
  });
}

/* ---------- Footer: staggered entrance + the final course lays plank by plank ---------- */
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

/* ---------- D2: NBS clause copy-to-clipboard ----------
   DRAFT clauses — each copied text is headed with a confirm-before-issue note.
   Swap this map for Vulcan's real NBS spec copy when it is supplied. */
const NBS_CLAUSES = {
  vulcalap: `NBS SOURCE CLAUSE (DRAFT - confirm the project clause with Vulcan before issue)
System: VulcaLap(R) aluminium plank rainscreen cladding
Manufacturer: Vulcan Cladding Systems - sales@vulcansystems.co.uk - 020 8681 0617
Reaction to fire: Classified A2-s1,d0 to BS EN 13501-1 (system classification, as tested)
Profile: Single-extrusion aluminium plank - no core, no laminate
Finish: Wood-grain or RAL polyester powder coat, Qualicoat approved
Fixings: Hidden fixings throughout, with aluminium trims in a matching finish`,
  vulcabar: `NBS SOURCE CLAUSE (DRAFT - confirm the project clause with Vulcan before issue)
System: VulcaBar(R) aluminium bar cladding / facade screen
Manufacturer: Vulcan Cladding Systems - sales@vulcansystems.co.uk - 020 8681 0617
Reaction to fire: Classified A2-s1,d0 to BS EN 13501-1 (system classification, as tested)
Profile: Single-extrusion aluminium bar sections - no core, no laminate
Finish: Wood-grain or RAL polyester powder coat, Qualicoat approved
Fixings: Hidden fixings throughout, with aluminium trims in a matching finish`,
  vulcaframe: `NBS SOURCE CLAUSE (DRAFT - confirm the project clause with Vulcan before issue)
System: VulcaFrame(TM) modular aluminium rainscreen cassettes
Manufacturer: Vulcan Cladding Systems - sales@vulcansystems.co.uk - 020 8681 0617
Reaction to fire: Classified A2-s1,d0 to BS EN 13501-1 (system classification, as tested)
Construction: Prefabricated offsite in 600 / 900 / 1200mm cassettes - no core, no laminate
Substrates: Suitable over brick, steel, concrete or existing cladding
Fixings: Hidden fixings throughout, with aluminium trims in a matching finish`,
};
document.querySelectorAll('[data-nbs]').forEach((btn) => {
  const idle = btn.textContent;
  btn.addEventListener('click', async () => {
    const text = NBS_CLAUSES[btn.dataset.nbs];
    if (!text || btn.classList.contains('is-copied')) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      /* clipboard API can be blocked (permissions/insecure context) — textarea fallback */
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    btn.textContent = 'Copied';
    btn.classList.add('is-copied');
    /* high-intent conversion event — picked up when analytics (GTM/Clarity) lands */
    (window.dataLayer = window.dataLayer || []).push({ event: 'nbs_clause_copy', system: btn.dataset.nbs });
    setTimeout(() => {
      btn.textContent = idle;
      btn.classList.remove('is-copied');
    }, 2200);
  });
});

/* ---------- Footer clock (the works' local time) + year ---------- */
const timeEl = document.getElementById('footer-time');
const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
const tickClock = () => (timeEl.textContent = timeFmt.format(new Date()));
tickClock();
setInterval(tickClock, 30000);
document.getElementById('year').textContent = new Date().getFullYear();
