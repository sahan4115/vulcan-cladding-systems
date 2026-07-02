import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Shape,
  ExtrudeGeometry,
  Mesh,
  MeshPhysicalMaterial,
  Group,
  PMREMGenerator,
  ACESFilmicToneMapping,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/*
 * Rotating VulcaLap tongue-and-groove extrusion.
 * Stands in for the client's CAD plank; swap the procedural profile for the
 * real CAD file (GLTF export) when it arrives.
 */
export function initPlank(canvas, { reduce } = {}) {
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

  /* T&G weatherboard cross-section: tongue on the right edge, groove on the left */
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

  const geo = new ExtrudeGeometry(s, {
    depth: 30,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  geo.center();

  const mat = new MeshPhysicalMaterial({
    color: 0xaeb6bd,
    metalness: 0.9,
    roughness: 0.42,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.8,
  });

  const plank = new Mesh(geo, mat);
  plank.scale.setScalar(0.9);
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
    return;
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
}
