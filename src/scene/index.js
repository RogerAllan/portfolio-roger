/* Carta estelar: monta a cena a partir dos módulos e expõe uma API pequena
   para a interface. Modos: boot → map ⇄ travel ⇄ system.
   Eventos emitidos: galaxy:hover {id|null}, galaxy:select {id},
   galaxy:arrived {id}, galaxy:planet {i, click}.
   Carregamento: api.ready resolve depois que texturas e modelos chegaram,
   foram enviados à GPU e todos os shaders foram compilados; só então o
   loop de render começa (nada compila ou sobe textura durante a navegação).
   onStep(nome) avisa cada etapa concluída: textures, models, shaders. */
import * as THREE from 'three';
import { fire, glowTexture, isSmall } from './util.js';
import { createStarfield } from './starfield.js';
import { createCore } from './core.js';
import { createSystems } from './systems.js';
import { createFleet } from './fleet.js';
import { loadModels } from './models.js';
import { createWarp } from './warp.js';
import { createLabels } from './labels.js';
import { createCameraRig } from './camera-rig.js';
import { createPicking } from './picking.js';

const TRAVEL_S = 2.4;

function loadPlanetMaps(list) {
  const loader = new THREE.TextureLoader();
  return Promise.all(list.map(({ url, kind }) => loader.loadAsync(url).then((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return { tex, kind };
  }).catch(() => null))).then((maps) => maps.filter(Boolean));
}

/* sobe todas as texturas e compila todos os programas com tudo visível,
   inclusive o que só aparece depois (órbitas, objetos de outros sistemas) */
async function warmUp(renderer, scene, camera) {
  const hidden = [];
  scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true; } });
  const seen = new Set();
  const upload = (v) => { if (v?.isTexture && !seen.has(v)) { seen.add(v); renderer.initTexture(v); } };
  scene.traverse((o) => {
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      for (const k in m) upload(m[k]);
      if (m.uniforms) for (const k in m.uniforms) upload(m.uniforms[k].value);
    }
  });
  try { await renderer.compileAsync(scene, camera); } catch { renderer.compile(scene, camera); }
  renderer.render(scene, camera);
  hidden.forEach((o) => { o.visible = false; });
}

export function initGalaxy({ canvas, systems, techCounts, labelsHost, nebulaUrls = [], homeTextures = null, planetMaps = [], onStep }) {
  const small = isSmall();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040406);
  scene.fog = new THREE.FogExp2(0x040406, 0.0042);
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1200);
  scene.add(camera);

  /* luz: ambiente, luz-chave no sistema aberto e um farol preso à câmera */
  const hemi = new THREE.HemisphereLight(0x8a96b0, 0x120408, 0.55);
  const key = new THREE.PointLight(0xffffff, 60, 40, 1.6);
  const headlight = new THREE.DirectionalLight(0xcfd8e6, 0.55);
  headlight.position.set(0, 0, 1);
  camera.add(headlight, headlight.target);
  headlight.target.position.set(0, 0, -1);
  scene.add(hemi, key);

  const glow = glowTexture();
  const starfield = createStarfield({ small, pixelRatio: renderer.getPixelRatio(), nebulaUrls });
  const core = createCore({ glow, pixelRatio: renderer.getPixelRatio() });
  const sys = createSystems({ systems, techCounts });
  const origin = sys.position('sobre');
  const fleet = createFleet(origin, glow);
  scene.add(starfield.group, core.group, sys.group, fleet.ship, fleet.gate, fleet.trail);
  const models = loadModels({ systems: sys, fleet });
  const warp = createWarp(camera);
  const labels = createLabels(labelsHost, systems);
  const rig = createCameraRig(camera, canvas, small);

  let mode = 'boot', current = null, hover = null, planetHover = -1;

  createPicking(canvas, camera, {
    getMode: () => mode,
    getTargets: () => (mode === 'map' ? sys.hitTargets : mode === 'system' && current ? sys.byId[current].planets : []),
    onHover(m, data) {
      if (m === 'map') {
        const id = data?.id ?? null;
        if (id !== hover) { hover = id; fire('galaxy:hover', { id }); }
      } else {
        const i = data?.i ?? -1;
        if (i !== planetHover) { planetHover = i; fire('galaxy:planet', { i, click: false }); }
      }
    },
    onSelect(m, data) {
      if (m === 'map') fire('galaxy:select', { id: data.id });
      else fire('galaxy:planet', { i: data.i, click: true });
    }
  });

  /* boot: câmera perto da origem, olhando o portal */
  rig.place(new THREE.Vector3(origin.x + 22, 6, origin.z + 20), fleet.gate.position);

  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  let live = false;
  const texturesReady = Promise.all([
    starfield.ready,
    homeTextures ? sys.byId.sobre.prop.api?.useTextures(homeTextures) : null,
    loadPlanetMaps(planetMaps).then((maps) => sys.usePlanetMaps(maps))
  ]).catch((err) => console.error(err)).then(() => onStep?.('textures'));
  const modelsReady = models.ready.catch(() => {}).then(() => onStep?.('models'));
  const ready = Promise.all([texturesReady, modelsReady])
    .then(() => warmUp(renderer, scene, camera))
    .catch((err) => console.error(err))
    .then(() => { onStep?.('shaders'); live = true; });

  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    if (document.hidden || !live) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    const s = current ? sys.byId[current] : null;

    rig.update(dt, { mode, orbitCenter: s?.g.position, follow: fleet.flying ? fleet.ship.position : null });
    warp.set(rig.travel);

    starfield.update(t);
    core.update(t, dt, camera);
    sys.update(t, dt, { camera, hover, current, planetHover });
    fleet.update(t, dt);
    models.update(dt);
    labels.update({ camera, byId: sys.byId, mode, hover, current, planetHover });

    /* a quarentena é escura por natureza: mais ambiente quando estamos lá */
    hemi.intensity += ((current === 'incidentes' ? 1.15 : 0.55) - hemi.intensity) * Math.min(1, dt * 2);
    key.position.copy(s ? s.g.position : camera.position);
    key.position.y += 2;

    renderer.render(scene, camera);
  })();

  const toMapView = () => rig.flyTo(rig.mapView(), 1.8, () => { mode = 'map'; rig.enableOrbit(); });

  return {
    ready,
    get mode() { return mode; },
    setLabels: (names) => labels.setNames(names),
    /* { id: [{ t: título, d: resumo }] } na ordem dos planetas */
    setPlanetInfo: (map) => labels.setPlanetInfo(map),
    /* abertura: atravessa o portal e abre o mapa (ou vai direto, se instant) */
    start(instant) {
      const mv = rig.mapView();
      if (instant) { rig.place(mv.pos, mv.target); mode = 'map'; rig.enableOrbit(); return; }
      rig.flyTo({ pos: fleet.gate.position.clone().add(new THREE.Vector3(0, 0.5, 0)), target: new THREE.Vector3() }, 1.6, () => {
        rig.flyTo(mv, 2.4, () => { mode = 'map'; rig.enableOrbit(); });
      });
    },
    goTo(id) {
      const target = sys.byId[id];
      if (!target) return;
      if (current) sys.showOrbits(current, false);
      mode = 'travel';
      current = id;
      fleet.flyTo(target.g.position, target.isCore, TRAVEL_S);
      rig.flyTo(rig.systemView(target.g.position, target.isCore), TRAVEL_S, () => {
        mode = 'system';
        sys.showOrbits(id, true);
        fire('galaxy:arrived', { id });
      });
    },
    toMap() {
      if (current) sys.showOrbits(current, false);
      current = null;
      mode = 'travel';
      toMapView();
    },
    highlight(id) { hover = id; },
    planetHover(i) { planetHover = i; },
    shake(a = 1) { rig.shake(a); core.pulse(a); }
  };
}
