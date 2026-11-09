import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Shape,
  Path,
  ExtrudeGeometry,
  BoxGeometry,
  Mesh,
  MeshPhysicalMaterial,
  Group,
  PMREMGenerator,
  ACESFilmicToneMapping,
  Box3,
  Vector3,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { gsap } from 'gsap';
import { TG150_PROFILE } from './tg150-profile.js';
import { TGS125_PROFILE } from './tgs125-profile.js';
import { VUL400_PROFILE } from './vul400-profile.js';
import { VUL850_OUTER, VUL850_CAVITY } from './vul850-profile.js';
import { VUL860, VUL825, VUL801 } from './bar-profiles.js';

/* trace a section's points (mm, mapped by pt) into a closed Shape or Path */
const trace = (Curve, points, pt) => {
  const c = new Curve();
  points.forEach((p, i) => (i ? c.lineTo(...pt(p)) : c.moveTo(...pt(p))));
  c.closePath();
  return c;
};

/*
 * Rotating system profiles, extruded from their sections.
 * VulcaLap and VulcaBar are the real sections from the client's DWGs, in units of 10 mm and turned
 * so the face, not the fixing side, comes towards the camera; all are shown as a 300 mm length at
 * the same scale, so their sizes compare true. VulcaFrame is the client's own STEP assemblies (Liviu, 4 Nov 2026),
 * baked to GLB; the procedural `s400` screen below is kept only as the offline fallback.
 */
const PROFILES = {
  /* T&G150 (see tg150-profile.js): the 173.8 mm board runs along x, its 14 mm depth along y. */
  vulcalap: {
    scale: 0.78,
    depth: 30,
    bevel: false,
    shape() {
      return trace(Shape, TG150_PROFILE, ([t, w]) => [w / 10, (14 - t) / 10]);
    },
  },
  /* TG125 (see tgs125-profile.js): 149.8 x 13.9 mm. */
  'vulcalap-tg125': {
    scale: 0.78,
    depth: 30,
    bevel: false,
    shape() {
      return trace(Shape, TGS125_PROFILE, ([t, w]) => [w / 10, (13.9 - t) / 10]);
    },
  },
  /* 400 Series plank (see vul400-profile.js): a 92 x 20 mm lipped channel, open side away. */
  'vulcalap-400': {
    scale: 0.78,
    depth: 30,
    bevel: false,
    shape() {
      return trace(Shape, VUL400_PROFILE, ([w, d]) => [w / 10, (20 - d) / 10]);
    },
  },
  /* VUL850 bar (see vul850-profile.js): 100 x 21.5 mm, hollow, with its two screw ports. */
  vulcabar: {
    scale: 0.78,
    depth: 30,
    bevel: false,
    shape() {
      const pt = ([d, w]) => [w / 10, d / 10];
      const s = trace(Shape, VUL850_OUTER, pt);
      s.holes.push(trace(Path, VUL850_CAVITY, pt));
      return s;
    },
  },
  /* VulcaBar bars, sliced from the client's STEP files (bar-profiles.js). The homepage tab keeps
     `vulcabar` (the 100 x 21.5 flat bar); the VulcaBar page adds the square bars. */
  'bar-square': {
    scale: 0.78,
    depth: 30,
    bevel: false,
    shape() {
      const pt = ([x, y]) => [x / 10, y / 10];
      const s = trace(Shape, VUL860.outer, pt);
      VUL860.holes.forEach((h) => s.holes.push(trace(Path, h, pt)));
      return s;
    },
  },
  /* the two-part bar: VUL825 sleeve with the VUL801 insert inside it. Two meshes, so the page
     can slide the insert out (`explode`). */
  'bar-two': {
    scale: 0.78,
    depth: 30,
    bevel: false,
    parts: [
      { key: 'sleeve', shape: () => trace(Shape, VUL825.outer, ([x, y]) => [x / 10, y / 10]) },
      { key: 'insert', shape: () => trace(Shape, VUL801.outer, ([x, y]) => [x / 10, y / 10]), explode: true },
    ],
  },
  /* VulcaFrame (key kept as `s400`): the modular screen — NOT a single extruded
     profile like the plank/bar, but a prefabricated, offsite-built framed panel:
     a portrait frame (top + bottom rails) spanned by evenly-spaced VERTICAL battens
     with OPEN gaps between them (a see-through brise-soleil screen). Assembled from
     merged boxes rather than a 2D extrusion. Match ref: vulcan-systems VulcaFrame. */
  s400: {
    scale: 0.5,
    build() {
      const Wx = 15;      // panel width  (portrait: tall + narrow, ~1:2.5)
      const Wy = 37;      // panel height
      const D = 2.2;      // frame + batten depth (front to back)
      const railH = 1.7;  // top / bottom rail thickness
      const battenW = 1.5;
      const nB = 6;       // vertical battens across the width
      const parts = [];

      /* top + bottom rails span the full width; battens hang between them */
      parts.push(new BoxGeometry(Wx, railH, D).translate(0, Wy / 2 - railH / 2, 0));
      parts.push(new BoxGeometry(Wx, railH, D).translate(0, -(Wy / 2 - railH / 2), 0));

      /* vertical battens, first + last flush to the edges, equal open gaps between —
         the "spaces in the middle" the screen is defined by */
      const battenSpan = Wy - 2 * railH;
      const step = (Wx - battenW) / (nB - 1);
      for (let i = 0; i < nB; i++) {
        const x = -Wx / 2 + battenW / 2 + i * step;
        parts.push(new BoxGeometry(battenW, battenSpan, D).translate(x, 0, 0));
      }

      return mergeGeometries(parts, false);
    },
  },
};

/*
 * VulcaFrame: five configurations, each open or with the backing sheet, from the client's STEP files.
 * GLBs are in metres, Y-up, X-wide, bars facing +Z, sheet behind, centred (see SESSION-CONTINUE.md,
 * 2026-11-09). Nothing downloads until the VulcaFrame tab is chosen. Keys: vf-<config>-<open|sheet>.
 * ⚠️ Asset URLs built in JS must carry import.meta.env.BASE_URL (GitHub Pages subpath).
 */
export const FRAME_CONFIGS = ['square-vertical', 'square-horizontal', 'flat-vertical', 'flat-horizontal', 'batten'];
export const frameKey = (config, sheet) => `vf-${config}-${sheet ? 'sheet' : 'open'}`;
FRAME_CONFIGS.forEach((c) =>
  ['open', 'sheet'].forEach((v) => {
    PROFILES[`vf-${c}-${v}`] = { glb: `${import.meta.env.BASE_URL}assets/models/vulcaframe/vf-${c}-${v}.glb` };
  }),
);
/* the 2.7 m panel, in stage units: the planks are 300 mm at 0.78 of 10 mm units, so ~23 long;
   the panel stands a touch shorter than that so it fits the tilt */
const FRAME_HEIGHT = 19;

let loaderP = null;
const glbCache = new Map();
const loadGlb = (url) => {
  if (!glbCache.has(url)) {
    loaderP ??= import('three/addons/loaders/GLTFLoader.js').then((m) => new m.GLTFLoader());
    glbCache.set(
      url,
      loaderP.then((loader) => new Promise((res, rej) => loader.load(url, (g) => res(g.scene), undefined, rej))),
    );
  }
  return glbCache.get(url);
};

const buildGeo = (key) => {
  const p = PROFILES[key];
  const geo = p.build
    ? p.build()
    : new ExtrudeGeometry(p.shape(), {
        depth: p.depth,
        bevelEnabled: p.bevel !== false,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 2,
      });
  geo.center();
  return geo;
};

export function initPlank(canvas, { reduce, profile = 'vulcalap' } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.78;

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 200);
  camera.position.set(0, 7, 34);
  camera.lookAt(0, 0, 0);

  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const mat = new MeshPhysicalMaterial({
    color: 0xaeb6bd,
    metalness: 0.9,
    roughness: 0.42,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.8,
  });

  /* the GLBs ship without normals to stay small; flat shading derives them per face, which is
     exactly right for extrusions. The backing sheet reads as a separate, duller skin behind the bars. */
  const frameMat = mat.clone();
  frameMat.flatShading = true;
  const sheetMat = frameMat.clone();
  sheetMat.color.set(0x394149);
  sheetMat.metalness = 0.55;
  sheetMat.roughness = 0.7;
  sheetMat.clearcoat = 0;

  /* build the object for a key: an extruded section, or the client's GLB scaled to the stage */
  const buildBody = async (key) => {
    const p = PROFILES[key];
    if (p.glb) {
      let src;
      try {
        src = await loadGlb(p.glb);
      } catch (err) {
        console.warn('[plank] VulcaFrame model unavailable, showing the stand-in', err);
        return buildBody('s400');
      }
      const g = src.clone();
      g.traverse((o) => {
        if (o.isMesh) o.material = o.name.startsWith('sheet') ? sheetMat : frameMat;
      });
      const size = new Box3().setFromObject(g).getSize(new Vector3());
      g.scale.setScalar(FRAME_HEIGHT / size.y);
      return g;
    }
    if (p.parts) {
      const g = new Group();
      p.parts.forEach((part) => {
        const geo = new ExtrudeGeometry(part.shape(), { depth: p.depth, bevelEnabled: false });
        geo.center();
        const m = new Mesh(geo, mat);
        m.userData.explode = !!part.explode;
        m.userData.depth = p.depth;
        g.add(m);
      });
      g.scale.setScalar(p.scale);
      return g;
    }
    const m = new Mesh(buildGeo(key), mat);
    m.scale.setScalar(p.scale);
    return m;
  };

  let active = PROFILES[profile] ? profile : 'vulcalap';
  let body = null;
  const holder = new Group(); /* what the swap tween scales; carries one body at a time */
  const place = (b) => {
    if (body) holder.remove(body);
    body = b;
    holder.add(b);
    resize(); /* camera distance depends on the body type */
  };
  const group = new Group();
  group.add(holder);
  group.rotation.set(0.52, 0.85, 0.06);
  scene.add(group);
  let token = 0;
  buildBody(active).then((b) => {
    if (token) return; /* a swap already superseded the first build */
    place(b);
    if (reduce) renderer.render(scene, camera);
  });

  /* sizing */
  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    /* pull back on narrow stages so the full plank stays in frame; the VulcaFrame panel is tall and
       narrow rather than long, so it can sit closer on a portrait stage */
    const frame = !!PROFILES[active].glb;
    camera.position.z = camera.aspect < 1 ? (frame ? 52 : 72) : camera.aspect < 1.6 ? (frame ? 44 : 48) : 40;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  /* profile swap: spin the old body out, bring the next one in. GLB bodies load while the old one
     spins out; the in-tween waits for whichever is later, and a newer pick cancels an older one. */
  let swapTl = null;
  const setProfile = (key) => {
    if (key === active || !PROFILES[key]) return;
    active = key;
    const my = ++token;
    const next = buildBody(key);
    if (reduce) {
      next.then((b) => {
        if (my !== token) return;
        place(b);
        renderer.render(scene, camera);
      });
      return;
    }
    if (swapTl) swapTl.kill();
    const out = gsap.timeline()
      .to(holder.scale, { x: 0.02, y: 0.02, z: 0.02, duration: 0.3, ease: 'power2.in' })
      .to(holder.rotation, { y: '+=1.3', duration: 0.3, ease: 'power2.in' }, 0);
    swapTl = out;
    Promise.all([next, new Promise((r) => out.eventCallback('onComplete', r))]).then(([b]) => {
      if (my !== token) return;
      place(b);
      holder.rotation.y = -1.1;
      swapTl = gsap.timeline()
        .to(holder.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'power3.out' })
        .to(holder.rotation, { y: 0, duration: 0.6, ease: 'power3.out' }, '<');
    });
  };

  /* drag to turn, with inertia */
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
    targetY += (e.clientX - lastX) * 0.008;
    targetX += (e.clientY - lastY) * 0.005;
    targetX = Math.max(-0.9, Math.min(1.1, targetX));
    lastX = e.clientX;
    lastY = e.clientY;
  });
  const endDrag = () => (dragging = false);
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  /* QA hook (harmless, mirrors window.__wall): hold the model at a chosen angle and
     render one still, so headless/preview captures don't depend on where the idle
     turntable happens to be. Only ever invoked manually. */
  /* slide a two-part bar's insert out of its sleeve: t in 0..1 */
  const explode = (t) => {
    if (!body) return;
    body.traverse((o) => {
      if (o.isMesh && o.userData.explode) o.position.z = o.userData.depth * 0.75 * t;
    });
    if (reduce) renderer.render(scene, camera);
  };

  window.__plank = {
    setProfile,
    explode,
    body: () => body,
    active: () => active,
    still(ry = 0.3, rx = 0.26) {
      targetY = ry;
      targetX = rx;
      group.rotation.set(rx, ry, 0);
      renderer.render(scene, camera);
    },
  };

  if (reduce) {
    renderer.render(scene, camera);
    return { setProfile, explode };
  }

  /* render only while on screen */
  let visible = false;
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
  });
  io.observe(canvas);

  let phase = 0;
  const tick = () => {
    if (visible) {
      /* idle motion: planks turn through; the thin VulcaFrame panel would read edge-on twice a
         turn, so it swings gently about the front instead */
      if (!dragging) {
        if (PROFILES[active].glb) {
          phase += 0.005;
          targetY = 0.42 + Math.sin(phase) * 0.5;
        } else targetY += 0.0035;
      }
      group.rotation.y += (targetY - group.rotation.y) * 0.08;
      group.rotation.x += (targetX - group.rotation.x) * 0.08;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  };
  tick();

  return { setProfile, explode };
}
