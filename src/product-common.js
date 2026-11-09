/*
 * Shared chrome for the product pages (VulcaBar, VulcaFrame): smooth scroll, nav, mobile
 * menu, dropdowns, product rail scrollspy, reveals, contact wall, footer and the two-step
 * enquiry dialog. Lifted from vulcalap.js, which keeps its own copy on purpose so the
 * reviewed VulcaLap bundle stays as approved. If you change behaviour here, mirror it
 * there (or fold vulcalap.js onto this module in one deliberate commit).
 */
import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import './styles.css';
import './vulcalap.css';
import './product-blocks.css'; /* after vulcalap.css so its overrides win */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = window.matchMedia('(pointer: fine)').matches;
document.documentElement.classList.add('js');
if (reduce) document.documentElement.classList.add('reduced');

/* ---------- Smooth scroll ---------- */
export let lenis = null;
if (!reduce) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
}

export const scrollToPos = (target) => {
  if (lenis) lenis.scrollTo(target, { offset: 0 });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else target.scrollIntoView();
};

/* ---------- Nav: solid always on inner pages; hides down / shows up ---------- */
const nav = document.querySelector('.nav');
const pnav = document.querySelector('.pnav');
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

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToPos(el);
  });
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

/* ---------- Hero entrance ---------- */
if (!reduce) {
  gsap.from('.phero-copy > *, .phero-shot, .phero-stage', { y: 34, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.15 });
}

/* ---------- Product rail: show after the hero, spotlight the section in view ---------- */
if (pnav) {
  ScrollTrigger.create({
    trigger: '#overview',
    start: 'top 65%',
    end: 'max',
    onToggle: (self) => pnav.classList.toggle('on', self.isActive),
  });
  const spyLinks = [...pnav.querySelectorAll('.pnav-links a')];
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
        if (self.isActive) spyLinks.forEach((l) => l.classList.toggle('is-active', l === a));
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
      opacity: 1, stagger: 0.045, ease: 'none',
      scrollTrigger: { trigger: stmt, start: 'top 78%', end: 'bottom 45%', scrub: true },
    });
  }
}

/* ---------- Section reveals + image treatments ---------- */
if (!reduce) {
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 84%', once: true } });
  });
  gsap.utils.toArray('[data-clip]').forEach((el) => {
    gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 38%', scrub: true } });
  });
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
} else {
  gsap.set('[data-reveal]', { opacity: 1, y: 0 });
}

/* ---------- Contact finale: a still plank wall (evenly lit, per the 16 Oct review) ---------- */
const wallCanvas = document.querySelector('.contact-wall');
if (wallCanvas) {
  const wctx = wallCanvas.getContext('2d');
  const wallStage = wallCanvas.closest('.contact-stage');
  const COURSE = 46;
  const LIT = 0.34;
  const mixc = (a, b, t) => a + (b - a) * t;
  const plankColor = (I) => {
    const t = I / 0.72;
    return `rgb(${mixc(4, 0, t) | 0},${mixc(38, 87, t) | 0},${mixc(61, 150, t) | 0})`;
  };
  const drawWall = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = wallStage.clientWidth;
    const H = wallStage.clientHeight;
    wallCanvas.width = Math.round(W * dpr);
    wallCanvas.height = Math.round(H * dpr);
    wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(10, Math.round(H / COURSE));
    for (let i = 0; i < n; i++) {
      const y = (i * H) / n;
      const h = H / n;
      wctx.fillStyle = plankColor(LIT);
      wctx.fillRect(0, y, W, h + 1);
      wctx.fillStyle = `rgba(167,172,216,${(LIT * 0.6).toFixed(3)})`;
      wctx.fillRect(0, y, W, 1.25);
      wctx.fillStyle = 'rgba(1, 16, 27, 0.5)';
      wctx.fillRect(0, y + h - 1, W, 1);
      wctx.fillStyle = 'rgba(1, 16, 27, 0.2)';
      wctx.fillRect(((i * 0.618034 + 0.23) % 1) * W, y, 1, h);
    }
  };
  drawWall();
  window.addEventListener('resize', drawWall);
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
document.querySelector('.footer-up')?.addEventListener('click', () => scrollToPos(0));

/* ---------- Footer clock + year ---------- */
const timeEl = document.getElementById('footer-time');
if (timeEl) {
  const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
  const tickClock = () => (timeEl.textContent = timeFmt.format(new Date()));
  tickClock();
  setInterval(tickClock, 30000);
}
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- ENQUIRY DIALOG -------------------------------------------------
   Same two-step form as the VulcaLap sample request (fields mirror Vulcan's live Gravity
   Form, including which are required). Step one captures the lead itself (what they want +
   name + phone + email) and fires a dataLayer event, so a drop-off on step two is still a
   lead for the Pipedrive hook at dev stage. BACKEND PENDING: set RQ_ENDPOINT; until then
   the enquiry is composed as a mailto so nothing is lost.
   `prefill()` lets a page preselect the first field from whatever it is showing.
   ------------------------------------------------------------------------- */
export const RQ_ENDPOINT = null;

export function initEnquiry({ prefill = null, subject = 'Enquiry', eventPrefix = 'enquiry', doneSent, doneMail } = {}) {
  const rq = document.getElementById('rqDialog');
  if (!rq) return null;
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
  let opener = null;

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
        if (!groupOk(g)) { ok = false; firstBad = firstBad || form.querySelector(`.rq-set[data-group="${g}"] input`); }
      });
    }
    topErr.hidden = ok;
    if (!ok) { topErr.textContent = 'A few details are still needed below.'; firstBad && firstBad.focus(); }
    return ok;
  };
  form.addEventListener('input', (e) => {
    const el = e.target;
    if (el.type === 'checkbox') {
      const set = el.closest('.rq-set[data-group]');
      if (set) groupOk(set.dataset.group);
    } else if (fieldOf(el)?.classList.contains('is-bad') && el.validity.valid) {
      setMsg(el, '');
    }
  });
  const conditional = (triggerSel, wrapId, on) => {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;
    const sync = () => { const show = on(); wrap.hidden = !show; if (!show) wrap.querySelector('input').value = ''; };
    form.querySelectorAll(triggerSel).forEach((el) => el.addEventListener('change', sync));
    sync();
  };
  conditional('input[name="type"]', 'rqTypeOtherWrap', () => form.querySelector('input[name="type"][value="Other"]').checked);
  conditional('#rqHeard', 'rqHeardOtherWrap', () => document.getElementById('rqHeard').value === 'Other');

  const show = (n) => {
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
    (window.dataLayer = window.dataLayer || []).push({
      event: `${eventPrefix}_lead`,
      name: `${form.first.value} ${form.last.value}`.trim(),
      phone: form.phone.value, email: form.email.value, samples: form.samples.value,
    });
    show(2);
  });
  backBtn.addEventListener('click', () => show(1));

  const openRq = (from) => {
    opener = from || null;
    if (prefill && sampleSel) {
      const want = prefill();
      if (want && [...sampleSel.options].some((o) => o.value === want)) sampleSel.value = want;
    }
    doneEl.hidden = true;
    form.hidden = false;
    show(1);
    rq.showModal();
    if (lenis) lenis.stop();
  };
  const closeRq = () => rq.close();
  document.querySelectorAll('[data-enquire]').forEach((btn) => btn.addEventListener('click', () => openRq(btn)));
  document.getElementById('rqClose').addEventListener('click', closeRq);
  document.getElementById('rqDoneClose').addEventListener('click', closeRq);
  rq.addEventListener('click', (e) => { if (e.target === rq) closeRq(); });
  rq.addEventListener('close', () => { if (lenis) lenis.start(); opener && opener.focus(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(2)) return;
    const d = Object.fromEntries(new FormData(form).entries());
    d.type = [...form.querySelectorAll('input[name="type"]:checked')].map((c) => c.value).join(', ');
    d.size = [...form.querySelectorAll('input[name="size"]:checked')].map((c) => c.value).join(', ');
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = 'Sending…';
    (window.dataLayer = window.dataLayer || []).push({ event: `${eventPrefix}_submit`, samples: d.samples });
    let sent = false;
    if (RQ_ENDPOINT) {
      try {
        const res = await fetch(RQ_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
        sent = res.ok;
      } catch (_) { sent = false; }
    }
    if (!sent) {
      const lines = [
        `Request: ${d.samples}`, `Name: ${d.first} ${d.last}`, `Phone: ${d.phone}`, `Email: ${d.email}`,
        `Company: ${d.company || '-'}`, `Project reference: ${d.reference}`,
        `Address: ${[d.street, d.town, d.county, d.postcode].filter(Boolean).join(', ')}, United Kingdom`,
        `Project type: ${d.type}${d.typeOther ? ` (${d.typeOther})` : ''}`,
        `Project size: ${d.size}`, `Start date: ${d.start}`,
        `Heard about us: ${d.heard || '-'}${d.heardOther ? ` (${d.heardOther})` : ''}`,
        '', 'Further information:', d.more || '-',
      ];
      window.location.href = 'mailto:sales@vulcansystems.co.uk?subject=' +
        encodeURIComponent(`${subject}: ${d.samples} — ${d.reference}`) + '&body=' + encodeURIComponent(lines.join('\n'));
    }
    submitBtn.removeAttribute('aria-busy');
    submitBtn.textContent = 'Send request';
    document.getElementById('rqDoneLine').textContent = sent
      ? (doneSent || 'We will be in touch shortly.')
      : (doneMail || 'Your email app has the request ready to send. Once it is away we will be in touch.');
    form.hidden = true;
    doneEl.hidden = false;
    document.getElementById('rqDoneClose').focus();
  });
  return { open: openRq, close: closeRq };
}

export { gsap, ScrollTrigger };
