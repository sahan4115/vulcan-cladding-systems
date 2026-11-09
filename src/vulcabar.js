/*
 * VulcaBar product page entry. Chrome + enquiry dialog come from product-common.js;
 * this file owns the 3D bar stage, the evidence schedule and the finish strip.
 */
import './product-blocks.css';
import { gsap, reduce, initEnquiry } from './product-common.js';

/* ---------- 02 THE BAR: the client's sections, live (plank.js) ----------
   Lazy, like the homepage: nothing from three.js loads until the stage is near. */
const BARS = {
  'bar-square': { name: 'One-part bar', line: 'A single hollow 42 mm square extrusion. Concealed fixings; colour-matched trims.', sample: 'One-part bar' },
  'bar-two': { name: 'Two-part bar', line: 'A 42 mm sleeve over a 39 mm insert, as supplied for balustrade frames. Slide the insert to see how they sit.', sample: 'Two-part bar' },
  vulcabar: { name: 'Flat bar', line: 'The 100 × 21.5 mm flat bar, its two screw ports hidden behind the face.', sample: 'Flat bar' },
};
const barStage = document.querySelector('.bst-stage');
let barApi = null;
let barKey = 'bar-square';
if (barStage) {
  const variants = gsap.utils.toArray('.bst-variants .plank-variant');
  const nameEl = document.getElementById('bstName');
  const lineEl = document.getElementById('bstLine');
  const explodeWrap = document.getElementById('bstExplodeWrap');
  const explode = document.getElementById('bstExplode');
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        import('./plank.js').then(({ initPlank }) => {
          barApi = initPlank(document.getElementById('barCanvas'), { reduce, profile: barKey });
          barApi.explode(explode.value / 100);
        });
      }
    },
    { rootMargin: '400px' },
  );
  io.observe(barStage);
  variants.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-active')) return;
      variants.forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      barKey = btn.dataset.profile;
      nameEl.textContent = BARS[barKey].name;
      lineEl.textContent = BARS[barKey].line;
      explodeWrap.hidden = barKey !== 'bar-two';
      if (barKey !== 'bar-two') explode.value = 0;
      if (barApi) barApi.setProfile(barKey);
    });
  });
  explode.addEventListener('input', () => {
    if (barApi) setTimeout(() => barApi.explode(explode.value / 100), 0);
  });
}

/* ---------- 04 THE EVIDENCE SCHEDULE (same behaviour as the VulcaLap page) ---------- */
const recPlate = document.getElementById('recPlate');
if (recPlate) {
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
        ? 'The full pack. We send it with the brochure as standard.'
        : `${n} selected — add more, or ask for these.`;
  };
  hits.forEach((hit) => {
    hit.addEventListener('click', () => {
      const on = hit.getAttribute('aria-pressed') !== 'true';
      hit.setAttribute('aria-pressed', String(on));
      on ? picked.add(hit.dataset.doc) : picked.delete(hit.dataset.doc);
      sync();
    });
  });
  sync();
  ctaEl.addEventListener('click', () => {
    const docs = [...picked];
    (window.dataLayer = window.dataLayer || []).push({ event: 'evidence_pack_request', system: 'VulcaBar', documents: docs });
    window.location.href = 'mailto:sales@vulcansystems.co.uk?subject=' + encodeURIComponent('VulcaBar evidence pack request') +
      '&body=' + encodeURIComponent('Please send the following VulcaBar documents:\n\n' + docs.map((d) => `- ${d}`).join('\n') + '\n\nProject:\nName:\nContact number:\n');
  });
}

/* ---------- 05 FINISHES: the strip names what you hover ---------- */
const finBars = gsap.utils.toArray('.fin-bar');
if (finBars.length) {
  const nameEl = document.getElementById('finName');
  let chosen = finBars.find((b) => b.classList.contains('is-on')) || finBars[0];
  const show = (b) => { nameEl.textContent = b.dataset.name; };
  finBars.forEach((b) => {
    b.addEventListener('pointerenter', () => show(b));
    b.addEventListener('focus', () => show(b));
    b.addEventListener('click', () => {
      chosen = b;
      finBars.forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      show(b);
    });
  });
  document.querySelector('.fin-bars').addEventListener('pointerleave', () => show(chosen));
}

/* ---------- ENQUIRY: preselect from the bar on the stage ---------- */
initEnquiry({
  subject: 'VulcaBar samples & estimate',
  eventPrefix: 'vulcabar_enquiry',
  prefill: () => `${BARS[barKey].sample} in WOOD finish`,
  doneSent: 'We will be in touch, and your samples go out with the brochure and the fire test report.',
});
