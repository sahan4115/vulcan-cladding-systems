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
const heroIntro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
heroIntro
  .from('.hero-title .line-inner', { yPercent: 112, duration: 1.0, stagger: 0.1 }, 0)
  .from('.hero-side', { y: 26, opacity: 0, duration: 0.8 }, 0.45)
  .fromTo('.hero-media-el', { scale: 1.12 }, { scale: 1.02, duration: 2.2, ease: 'power2.out' }, 0);

const finishPre = () => {
  preloader.classList.add('done');
  if (lenis) lenis.start();
};

if (reduce) {
  finishPre();
  gsap.set(['.hero-title .line-inner', '.hero-side'], { clearProps: 'all' });
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
ScrollTrigger.create({
  start: 30,
  onUpdate: (self) => nav.classList.toggle('scrolled', self.scroll() > 30),
  onToggle: (self) => nav.classList.toggle('scrolled', self.isActive),
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

/* ---------- Hero exits with depth as the story starts ---------- */
if (!reduce) {
  gsap.to('.hero-content', {
    yPercent: -16,
    opacity: 0.15,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 30%', scrub: true },
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
const mm = gsap.matchMedia();
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

/* ---------- Contact title reveal ---------- */
if (!reduce) {
  gsap.from('.contact-title .line-inner', {
    yPercent: 112, duration: 0.9, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact', start: 'top 72%', once: true },
  });
}

/* ---------- Case studies: expanding gallery ---------- */
const cols = gsap.utils.toArray('.exp-col');
const openCol = (target) => {
  cols.forEach((c) => {
    const on = c === target;
    c.classList.toggle('is-open', on);
    c.setAttribute('aria-expanded', String(on));
  });
};
cols.forEach((c) => {
  c.addEventListener('click', () => openCol(c));
  if (fine) c.addEventListener('mouseenter', () => openCol(c));
});

/* ---------- Finishes: diagonal wipe swatcher ---------- */
const finishImg = document.getElementById('finish-img');
const tint = document.querySelector('.finish-tint');
const wipe = document.querySelector('.finish-wipe');
const FINISHES = {
  cedar: { filter: 'none', tint: 'transparent' },
  oak: { filter: 'saturate(0.9)', tint: 'rgba(37, 22, 8, 0.52)' },
  anthracite: { filter: 'grayscale(1) brightness(0.82)', tint: 'rgba(24, 28, 32, 0.55)' },
  ral: { filter: 'grayscale(1) brightness(0.9)', tint: 'rgba(0, 87, 150, 0.72)' },
};
let wiping = false;
const applyFinish = (key) => {
  const f = FINISHES[key];
  finishImg.style.filter = f.filter;
  tint.style.backgroundColor = f.tint;
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

/* ---------- 3D plank (lazy) ---------- */
const plankStage = document.querySelector('.plank-stage');
if (plankStage) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        import('./plank.js').then(({ initPlank }) => initPlank(document.getElementById('plank-canvas'), { reduce }));
      }
    },
    { rootMargin: '400px' }
  );
  io.observe(plankStage);
}

/* ---------- Footer wordmark rises as the page ends ---------- */
if (!reduce) {
  gsap.from('.fw-name', {
    yPercent: 42,
    opacity: 0,
    ease: 'power3.out',
    duration: 1.1,
    scrollTrigger: { trigger: '.footer-wordmark', start: 'top 92%', once: true },
  });
}

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
