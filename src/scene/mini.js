/* Miniatura da carta estelar para o centro de comando: a mesma galáxia, o mesmo
   núcleo e os mesmos sistemas da versão 3D, sem nave, modelos nem navegação.
   A câmera só balança de leve, para os rótulos ficarem estáveis, e o desenho
   para quando a miniatura sai da tela. */
import * as THREE from 'three';
import { glowTexture } from './util.js';
import { createStarfield } from './starfield.js';
import { createCore } from './core.js';
import { createSystems } from './systems.js';

const FPS = 30;
const VIEW = new THREE.Vector3(30, 78, 104).multiplyScalar(0.92);
const SWAY = 0.14;

export function initMiniGalaxy({ canvas, systems, techCounts, nebulaUrls = [] }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040406);
  scene.fog = new THREE.FogExp2(0x040406, 0.0042);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1200);
  scene.add(camera);

  const hemi = new THREE.HemisphereLight(0x8a96b0, 0x120408, 0.55);
  const headlight = new THREE.DirectionalLight(0xcfd8e6, 0.55);
  headlight.position.set(0, 0, 1);
  camera.add(headlight, headlight.target);
  headlight.target.position.set(0, 0, -1);
  scene.add(hemi);

  const starfield = createStarfield({ small: true, pixelRatio: renderer.getPixelRatio(), nebulaUrls });
  const core = createCore({ glow: glowTexture(), pixelRatio: renderer.getPixelRatio() });
  const sys = createSystems({ systems, techCounts });
  scene.add(starfield.group, core.group, sys.group);

  const place = (t) => {
    camera.position.copy(VIEW).applyAxisAngle(THREE.Object3D.DEFAULT_UP, Math.sin(t * 0.09) * SWAY);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
  };
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  place(0);

  /* posição de cada sistema na tela, de 0 a 1 */
  const v = new THREE.Vector3();
  const project = () => Object.fromEntries(Object.keys(sys.byId).map((id) => {
    v.copy(sys.byId[id].g.position).project(camera);
    return [id, { x: v.x * 0.5 + 0.5, y: -v.y * 0.5 + 0.5 }];
  }));

  let active = null, visible = true, onFrame = null, raf = 0, last = 0, t = 0;
  const draw = (dt) => {
    t += dt;
    place(t);
    starfield.update(t);
    core.update(t, dt, camera);
    sys.update(t, dt, { camera, hover: active, current: null, planetHover: -1 });
    renderer.render(scene, camera);
    onFrame?.(project());
  };
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (document.hidden || !visible || now - last < 1000 / FPS) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    draw(dt);
  };

  const ready = Promise.resolve(starfield.ready)
    .then(() => renderer.compileAsync(scene, camera).catch(() => {}))
    .then(() => { draw(0.016); last = performance.now(); raf = requestAnimationFrame(frame); });

  return {
    ready,
    resize,
    setActive(id) { active = id; },
    setVisible(on) { visible = on; },
    setOnFrame(fn) { onFrame = fn; },
    stop() { cancelAnimationFrame(raf); }
  };
}
