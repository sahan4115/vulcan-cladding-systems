/*
 * VulcaLap product page — the 3D system experience.
 *
 * Two stages share this module:
 *   initFacade(canvas, opts)      — the hero: a full VulcaLap rainscreen build-up that
 *                                   opens into an exploded view on scroll (procedural,
 *                                   driven by a single 0..1 progress value so it stays
 *                                   correct through resizes; no timeline state to drift).
 *   initFinishStage(canvas, opts) — the finish configurator: a close plank rake whose
 *                                   material re-coats in real time.
 *
 * Everything is a stand-in for the client's CAD: the plank cross-section is the same
 * procedural T&G section used on the homepage (src/plank.js), extruded long. Swap for
 * the real GLTF when it arrives.
 */
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Shape,
  ExtrudeGeometry,
  BoxGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Group,
  Vector3,
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  Color,
  PMREMGenerator,
  ACESFilmicToneMapping,
  DirectionalLight,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';

/* ---------- Shared: the T&G150 cross-section (1 unit = 10 mm) ---------- */
/* Same section as the homepage plank stage: 150 cover, tongue on one edge,
   groove on the other, 14 deep. */
const tgShape = () => {
  const s = new Shape();
  s.moveTo(0, 0);
  s.lineTo(15, 0);
  s.lineTo(15, 0.45);
  s.lineTo(15.8, 0.45);
  s.lineTo(15.8, 0.95);
  s.lineTo(15, 0.95);
  s.lineTo(15, 1.4);
  s.lineTo(0, 1.4);
  s.lineTo(0, 0.95);
  s.lineTo(0.7, 0.95);
  s.lineTo(0.7, 0.45);
  s.lineTo(0, 0.45);
  s.closePath();
  return s;
};

/* Plank geometry oriented as installed: length along X, 150 cover vertical (Y),
   14 thickness in depth (Z), tongue pointing up. */
const plankGeo = (length) => {
  const geo = new ExtrudeGeometry(tgShape(), {
    depth: length,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 1,
  });
  geo.rotateZ(Math.PI / 2);
  geo.rotateY(Math.PI / 2);
  geo.center();
  return geo;
};

/* ---------- Procedural coated-aluminium finishes ---------- */
/* No textures on disk, so the wood-effect coat is painted onto an offscreen canvas:
   long tonal streaks + fine speck noise reads as a coil-coated grain at facade distance. */
const grainTexture = ({ base, dark, light }) => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = base;
  x.fillRect(0, 0, 1024, 256);
  const streak = (col, n, aMax, wMax) => {
    x.strokeStyle = col;
    for (let i = 0; i < n; i++) {
      const y0 = Math.random() * 256;
      x.globalAlpha = 0.04 + Math.random() * aMax;
      x.lineWidth = 0.6 + Math.random() * wMax;
      x.beginPath();
      x.moveTo(-20, y0);
      /* gentle drift so the grain never rules straight lines */
      for (let px = 0; px <= 1064; px += 88) {
        x.lineTo(px, y0 + Math.sin(px * 0.011 + i * 1.7) * (1.5 + Math.random() * 2.5));
      }
      x.stroke();
    }
    x.globalAlpha = 1;
  };
  /* broad tonal bands first, then the fine grain over them */
  for (let i = 0; i < 12; i++) {
    x.globalAlpha = 0.05 + Math.random() * 0.06;
    x.fillStyle = i % 2 ? dark : light;
    x.fillRect(0, Math.random() * 256, 1024, 8 + Math.random() * 22);
  }
  x.globalAlpha = 1;
  streak(dark, 70, 0.3, 2.6);
  streak(light, 48, 0.22, 1.6);
  /* speck noise: coating texture, very quiet */
  for (let i = 0; i < 900; i++) {
    x.globalAlpha = 0.028;
    x.fillStyle = i % 2 ? dark : light;
    x.fillRect(Math.random() * 1024, Math.random() * 256, 1.4, 1);
  }
  x.globalAlpha = 1;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
};

/* Finish library — the real range in miniature. Facts from the current VulcaLap page:
   wood-effect + RAL powder coats (ISO 12944-6:2018, C4, 25 yr; 10-yr warranty),
   anodised silver/bronze rated A1. */
export const FINISHES = {
  cedar: {
    label: 'Western Red Cedar',
    chip: '#a26a41',
    wood: { base: '#96613a', dark: '#64402a', light: '#b98a52' },
    roughness: 0.56, metalness: 0.14,
    note: 'Wood-effect powder coat · one of 11 timber looks · A2 fire-rated',
  },
  oak: {
    label: 'Dark Oak',
    chip: '#4a3423',
    wood: { base: '#503a26', dark: '#332415', light: '#7a5c3a' },
    roughness: 0.58, metalness: 0.14,
    note: 'Wood-effect powder coat · one of 11 timber looks · A2 fire-rated',
  },
  anthracite: {
    label: 'Anthracite',
    chip: '#3a3f43',
    color: '#394045',
    roughness: 0.5, metalness: 0.28,
    note: 'Smooth matt polyester powder coat · 25-year durability to ISO 12944-6 (C4)',
  },
  silver: {
    label: 'Anodised Silver',
    chip: '#c9ccd0',
    color: '#b7bcc2',
    roughness: 0.34, metalness: 0.85,
    note: 'Anodised aluminium · A1 non-combustible · 100% recyclable',
  },
  ral: {
    label: 'Any RAL colour',
    chip: '#005796',
    color: '#005796',
    roughness: 0.48, metalness: 0.22,
    note: 'The full RAL range · gloss levels and textures to order · 10-year warranty',
  },
};

const makeRenderer = (canvas, maxDpr) => {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  return renderer;
};

const envFor = (renderer, scene) => {
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
};

const plankMaterial = (finish) =>
  new MeshPhysicalMaterial({
    color: finish.wood ? 0xffffff : new Color(finish.color),
    map: finish.wood ? grainTexture(finish.wood) : null,
    metalness: finish.metalness,
    roughness: finish.roughness,
    clearcoat: 0.28,
    clearcoatRoughness: 0.55,
    envMapIntensity: 0.8,
  });

/* eased sub-segment of the master progress: 0 before a, 1 after b */
const seg = (p, a, b, ease = 'power2.inOut') => gsap.parseEase(ease)(gsap.utils.clamp(0, 1, (p - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;

/* ==========================================================================
   HERO — the system, opened
   ========================================================================== */
export function initFacade(canvas, { reduce = false, fine = true, labels = [], onProgressEls = {} } = {}) {
  const renderer = makeRenderer(canvas, 1.75);
  const scene = new Scene();
  envFor(renderer, scene);
  /* steep raking key from above, so every course lip draws its shadow line */
  const key = new DirectionalLight(0xffffff, 1.0);
  key.position.set(24, 150, 70);
  scene.add(key);

  const camera = new PerspectiveCamera(30, 1, 0.1, 2500);

  /* ----- the build-up (back to front) ----- */
  const WALL_W = 170;   /* 1.7 m of facade */
  const WALL_H = 120.8; /* 8 courses at 151 pitch */
  const PITCH = 15.1;
  const COURSES = 8;

  const world = new Group();
  scene.add(world);

  const matSubstrate = new MeshStandardMaterial({ color: 0x323a42, roughness: 1 });
  const matSheath = new MeshStandardMaterial({ color: 0x8f969b, roughness: 0.95 });
  const matInsul = new MeshStandardMaterial({ color: 0xc9bfae, roughness: 1 });
  const matMembrane = new MeshStandardMaterial({ color: 0x11161b, roughness: 0.7, metalness: 0.05 });
  const matRail = new MeshStandardMaterial({ color: 0x77808a, roughness: 0.38, metalness: 0.85 });
  const matPlank = plankMaterial(FINISHES.cedar);
  if (matPlank.map) matPlank.map.repeat.set(3, 1);

  /* backing layers sit INSIDE the plank footprint so nothing picture-frames the
     assembled facade — at p0 the camera sees planks only */
  const substrate = new Mesh(new BoxGeometry(WALL_W - 8, WALL_H - 8, 6), matSubstrate);
  const sheath = new Mesh(new BoxGeometry(WALL_W - 5, WALL_H - 5, 1.2), matSheath);
  const insul = new Mesh(new BoxGeometry(WALL_W - 5, WALL_H - 5, 5), matInsul);
  const membrane = new Mesh(new BoxGeometry(WALL_W - 5, WALL_H - 5, 0.18), matMembrane);
  world.add(substrate, sheath, insul, membrane);

  const rails = new Group();
  [-60, 0, 60].forEach((rx) => {
    const r = new Mesh(new BoxGeometry(2.4, WALL_H - 6, 2.5), matRail);
    r.position.x = rx;
    rails.add(r);
  });
  world.add(rails);

  /* each course gets its own coat: the shared grain image, offset and re-metered
     per plank, plus a V-groove shadow strip along its bottom edge — that is what
     makes the wall read as courses instead of one board */
  const matSeam = new MeshStandardMaterial({ color: 0x2a2018, roughness: 0.9 });
  /* proud of the face by a hair (no z-fighting with the plank front) — reads as the V-groove */
  const seamGeo = new BoxGeometry(WALL_W - 0.5, 0.5, 0.08);
  const courseGeo = plankGeo(WALL_W);
  const courses = [];
  const planks = new Group();
  for (let i = 0; i < COURSES; i++) {
    const mat = matPlank.clone();
    if (matPlank.map) {
      mat.map = matPlank.map.clone();
      mat.map.offset.x = (i * 0.37) % 1;
      mat.map.needsUpdate = true;
    }
    mat.color.multiplyScalar(0.93 + ((i * 0.618034) % 1) * 0.12);
    const m = new Mesh(courseGeo, mat);
    m.position.y = (i - (COURSES - 1) / 2) * PITCH;
    if (i > 0) {
      const seam = new Mesh(seamGeo, matSeam);
      seam.position.set(0, -PITCH / 2 + 0.1, 0.76);
      m.add(seam);
    }
    planks.add(m);
    courses.push(m);
  }
  world.add(planks);

  /* home / exploded Z per layer (planks pull forward first, deeper layers stagger after) */
  const LAYERS = [
    { obj: planks,    home: 5.8,  out: 52,  a: 0.30, b: 0.46 },
    { obj: rails,     home: 3.8,  out: 38,  a: 0.34, b: 0.50 },
    { obj: membrane,  home: 2.2,  out: 19,  a: 0.38, b: 0.54 },
    { obj: insul,     home: -0.6, out: 8,   a: 0.42, b: 0.58 },
    { obj: sheath,    home: -3.6, out: -5,  a: 0.42, b: 0.58 },
    { obj: substrate, home: -8,   out: -15, a: 0.42, b: 0.58 },
  ];
  LAYERS.forEach((l) => (l.obj.position.z = l.home));

  const HERO_I = 4; /* the course that slides out of the bond, like a length leaving the die */

  /* ----- camera fit: recomputed on resize so the wall frames at any aspect ----- */
  let fitD = 150;
  let portrait = false;
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    portrait = camera.aspect < 0.92;
    const vfov = (camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    /* distance at which the wall occupies fraction f of the frame on each axis */
    const fW = portrait ? 0.92 : 0.6;
    const fH = portrait ? 0.55 : 0.56;
    const dW = WALL_W / (2 * fW * Math.tan(hfov / 2));
    const dH = WALL_H / (2 * fH * Math.tan(vfov / 2));
    fitD = Math.max(dW, dH);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(() => {
    resize();
    apply(prog);
  });
  ro.observe(canvas.parentElement);

  /* pointer parallax (fine pointers only) */
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reduce && fine) {
    window.addEventListener('pointermove', (e) => {
      par.tx = e.clientX / window.innerWidth - 0.5;
      par.ty = e.clientY / window.innerHeight - 0.5;
    });
  }

  /* label anchors in wall space (world group) */
  const anchors = {
    plank: new Vector3(-34, (5 - 3.5) * PITCH * 1.3, 0),
    fix: new Vector3(120, (HERO_I - 3.5) * PITCH + 8, 0),
    rail: new Vector3(-60, 45, 0),
    buildup: new Vector3(85, -26, 0),
  };
  const v3 = new Vector3();

  const copyEl = onProgressEls.copy || null;
  const beatEl = onProgressEls.beat || null;
  const hintEl = onProgressEls.hint || null;
  const progEl = onProgressEls.progress || null;
  const stageEl = onProgressEls.stage || null;
  let stageWord = '';

  /* ----- the whole story as a function of p (0..1) ----- */
  let prog = 0;
  const apply = (p) => {
    prog = p;

    /* explode / reassemble: same curves mirrored around the hold (0.62–0.76) */
    const back = seg(p, 0.76, 0.9);
    LAYERS.forEach((l) => {
      const outT = seg(p, l.a, l.b, 'power3.inOut') * (1 - back);
      l.obj.position.z = lerp(l.home, l.out, outT);
    });
    /* courses rack apart vertically + the hero course draws out along its length */
    const fan = seg(p, 0.3, 0.48, 'power3.inOut') * (1 - back);
    courses.forEach((m, i) => {
      const yHome = (i - (COURSES - 1) / 2) * PITCH;
      m.position.y = yHome * lerp(1, 1.3, fan);
      m.position.x = i === HERO_I ? lerp(0, 40, seg(p, 0.4, 0.56, 'power3.inOut') * (1 - back)) : (i % 2 ? 1 : -1) * 3.2 * fan;
    });

    /* camera: dolly in, swing to a three-quarter view so the opened layers read
       in depth, then pull up and away to close */
    const drift = seg(p, 0.14, 0.52);
    const settle = seg(p, 0.86, 1);
    const cx = lerp(fitD * 0.08, fitD * 0.5, drift) * (1 - settle * 0.8) + par.x * 7;
    const cy = lerp(3, 20, drift) + lerp(0, 26, settle) + par.y * -5;
    const cz = lerp(fitD * 1.02, fitD * 0.88, drift) + lerp(0, fitD * 0.26, settle);
    camera.position.set(cx, cy, cz);
    /* composition: wall sits opposite the copy while the title is on, centres to open;
       the look target tracks mid-depth of the opened stack so the spread stays framed */
    const off = seg(p, 0.1, 0.34);
    const tx = portrait ? 0 : lerp(-WALL_W * 0.34, 0, off);
    const ty = portrait ? lerp(-100, 0, off) : lerp(2, 0, off);
    const tz = lerp(0, 20, seg(p, 0.3, 0.5)) * (1 - back);
    camera.lookAt(tx, ty, tz);

    /* DOM beats (all driven off the same p so nothing desyncs) */
    if (copyEl) {
      const t = seg(p, 0.06, 0.18, 'power1.in');
      copyEl.style.opacity = String(1 - t);
      copyEl.style.transform = `translateY(${t * -46}px)`;
      copyEl.style.pointerEvents = t > 0.6 ? 'none' : '';
    }
    if (hintEl) hintEl.style.opacity = String(1 - seg(p, 0.02, 0.1));
    labels.forEach((lb) => {
      const on = seg(p, lb.a, lb.a + 0.05) * (1 - seg(p, 0.72, 0.78));
      lb.el.style.opacity = String(on);
      if (on > 0) {
        v3.copy(anchors[lb.key]);
        /* follow the layer it names */
        if (lb.key === 'plank') v3.z = planks.position.z + 1.4;
        if (lb.key === 'fix') { v3.z = planks.position.z + 1.4; v3.x = 120 + courses[HERO_I].position.x - 40; }
        if (lb.key === 'rail') v3.z = rails.position.z + 1.6;
        if (lb.key === 'buildup') v3.z = insul.position.z;
        v3.applyMatrix4(world.matrixWorld).project(camera);
        const sx = (v3.x * 0.5 + 0.5) * canvas.clientWidth;
        const sy = (-v3.y * 0.5 + 0.5) * canvas.clientHeight;
        lb.el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
      }
    });
    if (beatEl) {
      const t = seg(p, 0.9, 0.985);
      beatEl.style.opacity = String(t);
      beatEl.style.transform = `translateY(${(1 - t) * 34}px)`;
    }
    if (progEl) progEl.style.transform = `scaleY(${p.toFixed(4)})`;
    if (stageEl) {
      const w = p < 0.28 ? 'Assembled' : p < 0.76 ? 'Opened' : 'Sealed';
      if (w !== stageWord) {
        stageWord = w;
        stageEl.textContent = w;
      }
    }
  };

  /* render only while the hero is on screen */
  let visible = true;
  const io = new IntersectionObserver((es) => {
    visible = es.some((e) => e.isIntersecting);
  });
  io.observe(canvas);

  if (reduce) {
    /* static assembled elevation — one render, no pin, no rAF */
    apply(0);
    renderer.render(scene, camera);
    window.__facade = { apply: (p) => { apply(p); renderer.render(scene, camera); } };
    return { apply };
  }

  gsap.ticker.add(() => {
    if (!visible) return;
    par.x += (par.tx - par.x) * 0.06;
    par.y += (par.ty - par.y) * 0.06;
    apply(prog);
    renderer.render(scene, camera);
  });

  /* QA hook: hidden preview panes never tick, so captures set progress by hand */
  window.__facade = { apply: (p) => { apply(p); renderer.render(scene, camera); } };

  return { apply };
}

/* ==========================================================================
   FINISH STAGE — re-coat the plank in real time
   ========================================================================== */
export function initFinishStage(canvas, { reduce = false } = {}) {
  const renderer = makeRenderer(canvas, 1.5);
  const scene = new Scene();
  envFor(renderer, scene);
  const key = new DirectionalLight(0xffffff, 0.9);
  key.position.set(-30, 50, 80);
  scene.add(key);

  const camera = new PerspectiveCamera(30, 1, 0.1, 500);

  /* a close rake of five courses, turned slightly so the shadow lines read */
  const base = plankMaterial(FINISHES.cedar);
  const matSeam = new MeshStandardMaterial({ color: 0x2a2018, roughness: 0.9 });
  const seamGeo = new BoxGeometry(89.5, 0.5, 0.08);
  const geo = plankGeo(90);
  const group = new Group();
  const mats = [];
  const meter = (i) => 0.93 + ((i * 0.618034) % 1) * 0.12;
  for (let i = 0; i < 5; i++) {
    const mat = base.clone();
    mats.push(mat);
    const m = new Mesh(geo, mat);
    m.position.y = (i - 2) * 15.1;
    if (i > 0) {
      const seam = new Mesh(seamGeo, matSeam);
      seam.position.set(0, -7.45, 0.76);
      m.add(seam);
    }
    group.add(m);
  }
  group.rotation.set(0.12, -0.52, 0.02);
  scene.add(group);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.set(8, 5, camera.aspect < 1 ? 175 : 148);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  /* pre-bake the wood maps once per finish per course (offset so boards differ),
     so a swap never stalls the frame */
  const woodMaps = {};
  Object.entries(FINISHES).forEach(([k, f]) => {
    if (f.wood) {
      const t = grainTexture(f.wood);
      t.repeat.set(2.4, 1);
      woodMaps[k] = mats.map((_, i) => {
        const c = t.clone();
        c.offset.x = (i * 0.37) % 1;
        c.needsUpdate = true;
        return c;
      });
    }
  });
  mats.forEach((mat, i) => {
    mat.map = woodMaps.cedar[i];
    mat.color.multiplyScalar(meter(i));
  });

  let activeKey = 'cedar';
  const setFinish = (fKey) => {
    const f = FINISHES[fKey];
    if (!f || fKey === activeKey) return;
    activeKey = fKey;
    mats.forEach((mat, i) => {
      const target = new Color(f.wood ? '#ffffff' : f.color).multiplyScalar(meter(i));
      mat.map = f.wood ? woodMaps[fKey][i] : null;
      mat.needsUpdate = true;
      if (reduce) {
        mat.color.copy(target);
        mat.roughness = f.roughness;
        mat.metalness = f.metalness;
        return;
      }
      gsap.to(mat.color, { r: target.r, g: target.g, b: target.b, duration: 0.55, ease: 'power2.out' });
      gsap.to(mat, { roughness: f.roughness, metalness: f.metalness, duration: 0.55, ease: 'power2.out' });
    });
    if (reduce) {
      renderer.render(scene, camera);
      return;
    }
    /* the light answers the coat change — a quiet dip and recover, like a lamp re-metering */
    gsap.fromTo(key, { intensity: 0.5 }, { intensity: 0.9, duration: 0.9, ease: 'power2.out' });
    gsap.fromTo(group.rotation, { y: group.rotation.y - 0.16 }, { y: -0.52, duration: 1.1, ease: 'power3.out' });
  };

  /* drag to turn, inertia-smoothed (same feel as the homepage plank stage) */
  let targetY = group.rotation.y;
  let targetX = group.rotation.x;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    targetY += (e.clientX - lastX) * 0.006;
    targetX += (e.clientY - lastY) * 0.004;
    targetY = Math.max(-1.1, Math.min(0.35, targetY));
    targetX = Math.max(-0.3, Math.min(0.5, targetX));
    lastX = e.clientX;
    lastY = e.clientY;
  });
  const endDrag = () => (dragging = false);
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  if (reduce) {
    renderer.render(scene, camera);
    window.__finish = { setFinish };
    return { setFinish };
  }

  let visible = false;
  const io = new IntersectionObserver((es) => {
    visible = es.some((e) => e.isIntersecting);
  });
  io.observe(canvas);

  gsap.ticker.add(() => {
    if (!visible) return;
    if (!dragging && !gsap.isTweening(group.rotation)) {
      group.rotation.y += (targetY - group.rotation.y) * 0.07;
      group.rotation.x += (targetX - group.rotation.x) * 0.07;
    }
    renderer.render(scene, camera);
  });

  window.__finish = { setFinish };
  return { setFinish };
}
