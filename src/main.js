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
  .from('.hero-side', { y: 26, opacity: 0, duration: 0.8 }, 0.55)
  .fromTo('.hero-media-el', { scale: 1.12 }, { scale: 1.02, duration: 2.2, ease: 'power2.out' }, 0);

const finishPre = () => {
  preloader.classList.add('done');
  if (lenis) lenis.start();
};

if (reduce) {
  finishPre();
  gsap.set(['.hero-title .line-inner', '.hero-side'], { clearProps: 'all' });
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

/* ---------- Contact: pinned constellation finale (desktop, motion allowed) ---------- */
mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
  const stage = document.querySelector('.contact-stage');
  splitTitle(document.querySelector('.contact-title'));
  const cards = gsap.utils.toArray('.ccard');

  /* scroll assembly: depth first, type, cards drift in, copy, then the CTA */
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: stage, start: 'top top', end: '+=75%', pin: true, scrub: 0.6 },
  });
  tl.from('.contact-bg', { scale: 1.18, opacity: 0, duration: 0.4 }, 0)
    .from('.contact-title .ch', { yPercent: 120, duration: 0.45, stagger: 0.012 }, 0.05)
    .from(cards, {
      x: (i) => (i % 2 ? 170 : -170) * (1 + (i % 3) * 0.3),
      y: (i) => 90 + (i % 4) * 45,
      opacity: 0,
      rotation: (i) => (i % 2 ? 9 : -8),
      duration: 0.5,
      stagger: 0.05,
    }, 0.1)
    .from('.contact-inner p', { y: 28, opacity: 0, duration: 0.3 }, 0.55)
    .from('.contact-cta-wrap', { y: 42, opacity: 0, duration: 0.32 }, 0.7);

  /* idle drift on the images, so the wall never feels frozen */
  const floats = cards.map((c, i) =>
    gsap.to(c.querySelector('img'), {
      y: `+=${9 + (i % 3) * 5}`,
      duration: 3.2 + (i % 4) * 0.8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      delay: (i % 5) * 0.35,
    })
  );

  /* mouse-follow parallax, depth-weighted */
  const layers = cards.map((c, i) => ({
    qx: gsap.quickTo(c.querySelector('.ccard-par'), 'x', { duration: 1.1, ease: 'power3.out' }),
    qy: gsap.quickTo(c.querySelector('.ccard-par'), 'y', { duration: 1.1, ease: 'power3.out' }),
    depth: (c.classList.contains('near') ? 26 : 12) * (i % 2 ? 1 : -1),
  }));
  const bgx = gsap.quickTo('.contact-bg', 'x', { duration: 1.4, ease: 'power3.out' });
  const bgy = gsap.quickTo('.contact-bg', 'y', { duration: 1.4, ease: 'power3.out' });
  const onMove = (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    layers.forEach(({ qx, qy, depth }) => {
      qx(nx * depth * 1.6);
      qy(ny * depth);
    });
    bgx(nx * -14);
    bgy(ny * -10);
  };
  stage.addEventListener('pointermove', onMove);

  return () => {
    stage.removeEventListener('pointermove', onMove);
    floats.forEach((f) => f.kill());
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
    gsap.set(
      ['.ccard', '.ccard-par', '.ccard img', '.contact-bg', '.contact-title .ch', '.contact-inner p', '.contact-cta-wrap'],
      { clearProps: 'all' }
    );
  };
});

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

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
