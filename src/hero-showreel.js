/* Homepage hero: Alfie's showreel stage. The interface reads the film: the headline beat,
   kicker and accent colour follow whichever material is on screen. Ported from
   vulcan-showreel.html with the timecode, shot slate and shot index removed (his call,
   2026-10-16); the cut list below is his, from the v5 edit. */

// Cut list from the v5 showreel edit (seconds); materials alternate in short acts (0 = aluminium, 1 = timber).
const SHOTS = [
  { t: 0.0, m: 0 },
  { t: 2.8, m: 0 },
  { t: 5.2, m: 1 },
  { t: 7.6, m: 1 },
  { t: 10.2, m: 0 },
  { t: 12.8, m: 0 },
  { t: 15.2, m: 1 },
  { t: 17.6, m: 1 },
  { t: 20.0, m: 1 },
];

const KICKERS = ['A2 fire-rated · CWCT tested', 'The character of natural timber'];

export function initShowreel(stage, { reduce = false } = {}) {
  if (!stage) return;
  const v = stage.querySelector('video');
  /* reduced motion: hold the film on its poster (frame 0, the aluminium act) */
  if (reduce) {
    v.removeAttribute('autoplay');
    v.pause();
    return;
  }
  const beats = [stage.querySelector('[data-beat="alu"]'), stage.querySelector('[data-beat="timber"]')];
  const kick = stage.querySelector('.sr-kicker');

  let curAct = 0;

  const setAct = (a) => {
    if (a === curAct) return;
    curAct = a;
    stage.style.setProperty('--sr-accent', a === 1 ? 'var(--sr-amber)' : 'var(--sr-steel)');
    kick.textContent = KICKERS[a];
    const show = beats[a];
    const hide = beats[1 - a];
    hide.classList.add('off');
    hide.setAttribute('aria-hidden', 'true');
    show.classList.remove('off');
    show.removeAttribute('aria-hidden');
    // retrigger the line reveal
    const spans = show.querySelectorAll('.sr-bl span');
    spans.forEach((sp) => {
      sp.style.transition = 'none';
      sp.style.transform = 'translateY(110%)';
    });
    void show.offsetWidth;
    spans.forEach((sp) => {
      sp.style.transition = '';
      sp.style.transform = '';
    });
  };

  const tick = () => {
    const t = v.currentTime || 0;
    let i = SHOTS.length - 1;
    while (i > 0 && t < SHOTS[i].t) i--;
    setAct(SHOTS[i].m);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
