import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Shape,
  Path,
  ExtrudeGeometry,
  Mesh,
  MeshPhysicalMaterial,
  Group,
  PMREMGenerator,
  ACESFilmicToneMapping,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';

/*
 * Rotating system profiles, procedurally extruded.
 * Stand-ins for the client's CAD sections; swap each shape() for the real
 * CAD file (GLTF export) when it arrives.
 */
const PROFILES = {
  /* T&G weatherboard cross-section: tongue on the right edge, groove on the left */
  vulcalap: {
    scale: 0.9,
    depth: 30,
    shape() {
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
    },
  },
  /* hollow rectangular bar section — one closed extrusion, nothing hidden */
  vulcabar: {
    scale: 1.05,
    depth: 30,
    shape() {
      const s = new Shape();
      s.moveTo(0, 0);
      s.lineTo(7, 0);
      s.lineTo(7, 3);
      s.lineTo(0, 3);
      s.closePath();
      const hole = new Path();
      hole.moveTo(0.4, 0.4);
      hole.lineTo(0.4, 2.6);
      hole.lineTo(6.6, 2.6);
      hole.lineTo(6.6, 0.4);
      hole.closePath();
      s.holes.push(hole);
      return s;
    },
  },
  /* 400 Series: the wider, bolder plank — same interlock family, fewer lines */
  s400: {
    scale: 0.64,
    depth: 34,
    shape() {
      const s = new Shape();
      s.moveTo(0, 0);
      s.lineTo(22, 0);
      s.lineTo(22, 0.5);
      s.lineTo(22.9, 0.5);
      s.lineTo(22.9, 1.1);
      s.lineTo(22, 1.1);
      s.lineTo(22, 1.6);
      s.lineTo(0, 1.6);
      s.lineTo(0, 1.1);
      s.lineTo(0.8, 1.1);
      s.lineTo(0.8, 0.5);
      s.lineTo(0, 0.5);
      s.closePath();
      return s;
    },
  },
};

const buildGeo = (key) => {
  const p = PROFILES[key];
  const geo = new ExtrudeGeometry(p.shape(), {
    depth: p.depth,
    bevelEnabled: true,
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

  let active = PROFILES[profile] ? profile : 'vulcalap';
  const plank = new Mesh(buildGeo(active), mat);
  plank.scale.setScalar(PROFILES[active].scale);
  const group = new Group();
  group.add(plank);
  group.rotation.set(0.52, 0.85, 0.06);
  scene.add(group);

  /* sizing */
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    /* pull back on narrow stages so the full plank stays in frame */
    camera.position.z = camera.aspect < 1 ? 58 : camera.aspect < 1.6 ? 48 : 40;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  /* profile swap: spin the old section out, extrude the next one in */
  let swapTl = null;
  const setProfile = (key) => {
    if (key === active || !PROFILES[key]) return;
    active = key;
    const doSwap = () => {
      plank.geometry.dispose();
      plank.geometry = buildGeo(key);
    };
    const s = PROFILES[key].scale;
    if (reduce) {
      doSwap();
      plank.scale.setScalar(s);
      renderer.render(scene, camera);
      return;
    }
    if (swapTl) swapTl.kill();
    swapTl = gsap.timeline()
      .to(plank.scale, { x: 0.02, y: 0.02, z: 0.02, duration: 0.3, ease: 'power2.in' })
      .to(plank.rotation, { y: '+=1.3', duration: 0.3, ease: 'power2.in' }, 0)
      .add(() => {
        doSwap();
        plank.rotation.y = -1.1;
      })
      .to(plank.scale, { x: s, y: s, z: s, duration: 0.6, ease: 'power3.out' })
      .to(plank.rotation, { y: 0, duration: 0.6, ease: 'power3.out' }, '<');
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

  if (reduce) {
    renderer.render(scene, camera);
    return { setProfile };
  }

  /* render only while on screen */
  let visible = false;
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
  });
  io.observe(canvas);

  const tick = () => {
    if (visible) {
      if (!dragging) targetY += 0.0035; /* idle turntable */
      group.rotation.y += (targetY - group.rotation.y) * 0.08;
      group.rotation.x += (targetX - group.rotation.x) * 0.08;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  };
  tick();

  return { setProfile };
}
