/*
 * Downloads page entry. Chrome (nav, menu, dropdowns, reveals, magnetic, contact
 * wall, footer clock) is duplicated from cases.js / vulcalap.js on purpose —
 * the convention this project set: verified bundles stay untouched.
 * Page-specific work: THE TAKE-OFF, the schedule that issues itself.
 */
import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import './styles.css';
import './downloads.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, Flip);

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
if (!reduce) {
  const navTween = gsap.quickTo(nav, 'yPercent', { duration: 0.45, ease: 'power3.out' });
  ScrollTrigger.create({
    start: 'top top',
    onUpdate: (self) => {
      const up = self.scroll() >= 120 && self.direction !== -1 && !nav.classList.contains('menu-open');
      navTween(up ? -100 : 0);
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

/* ---------- The document register ------------------------------------------
   One axis: can you have it now, or do you ask for it. Every count on the page
   is DERIVED from the rows in the markup — the tab counts and the two hero
   figures — so a figure can never drift from the list the way a hand-typed
   number does. Adding a row to the HTML is the only edit a new document needs.

   The filter is a real button group with aria-pressed, not a faked tab/tabpanel
   contract. Filtered rows use [hidden]; .dl-item is a grid, which beats the UA
   [hidden] rule, so the stylesheet carries display:none !important.

   With no JS every row stands and the tabs are removed, because a document
   register that needs script to list documents is broken. */
const reg = document.getElementById('dlReg');
if (reg) {
  const items = [...reg.querySelectorAll('.dl-item')];
  const tabs = [...document.querySelectorAll('.dl-tab')];
  const emptyEl = document.getElementById('dlEmpty');

  const countOf = (f) => (f === 'all' ? items.length : items.filter((i) => i.dataset.kind === f).length);

  /* every figure on the page comes from the rows themselves */
  tabs.forEach((t) => { t.querySelector('i').textContent = String(countOf(t.dataset.filter)).padStart(2, '0'); });
  const nowEl = document.getElementById('dlCountNow');
  const reqEl = document.getElementById('dlCountReq');
  if (nowEl) nowEl.textContent = String(countOf('now'));
  if (reqEl) reqEl.textContent = String(countOf('request'));

  const apply = (filter, animate) => {
    const state = !reduce && animate && window.Flip ? Flip.getState(items) : null;

    items.forEach((i) => { i.hidden = filter !== 'all' && i.dataset.kind !== filter; });
    tabs.forEach((t) => {
      const on = t.dataset.filter === filter;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (emptyEl) emptyEl.hidden = items.some((i) => !i.hidden);

    if (state) Flip.from(state, { duration: 0.55, ease: 'power3.out', absolute: true, stagger: 0.02 });

    /* a filtered view is shareable, and arriving on one lands on its tab */
    const url = new URL(window.location);
    if (filter === 'all') url.searchParams.delete('show');
    else url.searchParams.set('show', filter);
    window.history.replaceState({}, '', url);
  };

  tabs.forEach((t) => t.addEventListener('click', () => apply(t.dataset.filter, true)));

  const preset = new URL(window.location).searchParams.get('show');
  apply(['now', 'request'].includes(preset) ? preset : 'all', false);
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

/* ---------- Footer clock + year ---------- */
const timeEl = document.getElementById('footer-time');
const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
const tickClock = () => (timeEl.textContent = timeFmt.format(new Date()));
tickClock();
setInterval(tickClock, 30000);
document.getElementById('year').textContent = new Date().getFullYear();
