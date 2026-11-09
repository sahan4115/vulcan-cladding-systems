/*
 * VulcaFrame product page entry. Chrome + enquiry dialog come from product-common.js;
 * this file owns the configurator in the hero (the client's GLBs via plank.js), the
 * finish strip and the project reveal.
 */
import { gsap, reduce, initEnquiry } from './product-common.js';

/* ---------- HERO CONFIGURATOR ---------- */
const CONFIGS = {
  'square-vertical': { name: 'Square bar, vertical', line: 'Seven 42 mm square bars in a 600 × 2700 mm frame.', sample: 'Square bar, vertical' },
  'square-horizontal': { name: 'Square bar, horizontal', line: 'Twenty 42 mm square bars across a 600 × 2700 mm frame.', sample: 'Square bar, horizontal' },
  'flat-vertical': { name: 'Flat bar, vertical', line: 'Four 100 mm flat bars, face on, in a 600 × 2700 mm frame.', sample: 'Flat bar, vertical' },
  'flat-horizontal': { name: 'Flat bar, horizontal', line: 'Fourteen 100 mm flat bars across a 600 × 2700 mm frame.', sample: 'Flat bar, horizontal' },
  batten: { name: 'Batten screen', line: 'Seven two-part 42 mm bars on concealed rails, no top or bottom frame.', sample: 'Batten screen' },
};
const cfg = document.getElementById('configure');
let config = 'square-vertical';
let sheet = false;
let frameApi = null;
const key = () => `vf-${config}-${sheet ? 'sheet' : 'open'}`;
if (cfg) {
  const variants = gsap.utils.toArray('.cfg-controls .plank-variant');
  const toggle = document.querySelector('.cfg-controls .plank-toggle'); /* the bar sits outside #configure on the hero layout */
  const nameEl = document.getElementById('cfgName');
  const lineEl = document.getElementById('cfgLine');
  const read = () => {
    nameEl.textContent = CONFIGS[config].name;
    lineEl.textContent = `${CONFIGS[config].line} ${sheet ? 'With the backing sheet, so the screen closes.' : 'Open, so light and air pass through.'}`;
  };
  /* the hero is on screen at load: start the stage straight away (the GLB loads lazily inside) */
  import('./plank.js').then(({ initPlank }) => {
    /* stands tall and nearly upright: the hero stage is the whole viewport, so let it fill it */
    frameApi = initPlank(document.getElementById('frameCanvas'), { reduce, profile: key(), tilt: 0.16, frameHeight: 20 });
  });
  variants.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-active')) return;
      variants.forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      config = btn.dataset.profile;
      read();
      if (frameApi) frameApi.setProfile(key());
      (window.dataLayer = window.dataLayer || []).push({ event: 'vulcaframe_configure', config, sheet });
    });
  });
  toggle.addEventListener('click', () => {
    sheet = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(sheet));
    read();
    if (frameApi) frameApi.setProfile(key());
    (window.dataLayer = window.dataLayer || []).push({ event: 'vulcaframe_configure', config, sheet });
  });
}

/* ---------- FINISHES: the strip names what you hover ---------- */
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

/* ---------- ENQUIRY: preselect the configuration on the stage ---------- */
initEnquiry({
  subject: 'VulcaFrame enquiry',
  eventPrefix: 'vulcaframe_enquiry',
  prefill: () => CONFIGS[config].sample,
  doneSent: 'We will be in touch with a drawing, a sample and a price.',
});
