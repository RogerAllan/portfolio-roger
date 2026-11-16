/* Câmera: OrbitControls no mapa, voo suavizado entre pontos de vista e deriva
   lenta em volta do sistema aberto. `look` é o ponto para onde a câmera olha. */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ease } from './util.js';

const UP = new THREE.Vector3(0, 1, 0);

export function createCameraRig(camera, dom, small) {
  const controls = new OrbitControls(camera, dom);
  Object.assign(controls, {
    enableDamping: true, dampingFactor: 0.06, enablePan: false,
    minDistance: 28, maxDistance: 170, maxPolarAngle: 1.32,
    autoRotate: true, autoRotateSpeed: 0.18, enabled: false
  });

  const look = new THREE.Vector3();
  const v = new THREE.Vector3();
  let tween = null, shake = 0;

  const mapView = () => ({ pos: new THREE.Vector3(30, 78, 104), target: new THREE.Vector3(0, 0, 0) });

  /* ponto de vista de um sistema: a estrela fica à esquerda, o dossiê ocupa a direita */
  function systemView(p, isCore) {
    const dist = isCore ? 46 : 15;
    const dir = new THREE.Vector3(p.x, 0, p.z).normalize();
    if (!isFinite(dir.x) || dir.lengthSq() === 0) dir.set(0.6, 0, 0.8);
    const side = new THREE.Vector3(-dir.z, 0, dir.x);
    return {
      pos: p.clone().addScaledVector(dir, dist * 0.8).addScaledVector(side, dist * 0.35).add(new THREE.Vector3(0, dist * 0.42, 0)),
      target: p.clone().addScaledVector(side, small ? 0 : -(isCore ? 9 : 3.2))
    };
  }

  return {
    look, controls, mapView, systemView,
    get traveling() { return !!tween; },
    /* progresso 0–1 do voo atual (para o efeito de dobra e a câmera seguir a nave) */
    get travel() { return tween ? Math.sin(Math.min(1, tween.t) * Math.PI) * (tween.warp ? 1 : 0) : 0; },
    place(pos, target) { camera.position.copy(pos); look.copy(target); camera.lookAt(look); },
    flyTo({ pos, target }, dur, onDone, warp = true) {
      tween = { from: camera.position.clone(), fromT: look.clone(), pos, target, t: 0, dur, onDone, warp };
      controls.enabled = false;
    },
    enableOrbit() { controls.target.copy(look); controls.enabled = true; },
    shake(a) { shake = Math.min(1.6, shake + a); },
    update(dt, { mode, orbitCenter, follow }) {
      if (tween) {
        tween.t += dt / tween.dur;
        const k = ease(Math.min(1, tween.t));
        camera.position.lerpVectors(tween.from, tween.pos, k);
        look.lerpVectors(tween.fromT, tween.target, k);
        /* durante o voo, o olhar puxa para a nave */
        if (follow) look.lerp(follow, Math.sin(Math.min(1, tween.t) * Math.PI) * 0.45);
        if (tween.t >= 1) { const done = tween.onDone; tween = null; done && done(); }
      }
      if (mode === 'map' && controls.enabled) {
        controls.update();
        look.copy(controls.target);
      } else {
        if (mode === 'system' && orbitCenter && !tween) {
          v.copy(camera.position).sub(orbitCenter).applyAxisAngle(UP, dt * 0.03);
          camera.position.copy(orbitCenter).add(v);
        }
        camera.lookAt(look);
      }
      if (shake > 0.001) {
        camera.position.x += (Math.random() - 0.5) * shake * 0.5;
        camera.position.y += (Math.random() - 0.5) * shake * 0.5;
        shake *= Math.pow(0.03, dt);
      }
    }
  };
}
