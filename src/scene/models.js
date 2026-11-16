/* Modelos glTF opcionais (public/models/manifest.json). Cada papel tem um
   tamanho-alvo e um destino na cena; sem o arquivo, a reserva procedural fica. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/* centraliza e escala o objeto para caber num cubo de lado `size` */
function fitInto(obj, size) {
  const box = new THREE.Box3().setFromObject(obj);
  const v = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const k = size / Math.max(v.x, v.y, v.z || 1);
  obj.scale.setScalar(k);
  obj.position.sub(c.multiplyScalar(k));
  const wrap = new THREE.Group();
  wrap.add(obj);
  return wrap;
}

/* o olho é um disco: gira o eixo mais fino para +Z, para onde o lookAt aponta */
function faceForward(obj) {
  const v = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
  if (v.x <= v.y && v.x <= v.z) obj.rotation.y = Math.PI / 2;
  else if (v.y <= v.x && v.y <= v.z) obj.rotation.x = -Math.PI / 2;
  const holder = new THREE.Group();
  holder.add(obj);
  return holder;
}

export function loadModels({ systems, fleet, onEach }) {
  const mixers = [];
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const roles = {
    ship: [1.1, (w) => fleet.setShipModel(w)],
    gate: [8, (w) => fleet.setGateModel(w)],
    eye: [4.2, (w) => { const s = systems.byId.dados; s.star.visible = false; s.prop.replaceWith(faceForward(w)); }],
    crystal: [3.6, (w) => systems.byId.ia.prop.replaceWith(w)]
  };

  /* resolve quando todos os modelos chegaram (ou falharam e ficou a reserva) */
  const ready = fetch('/models/manifest.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((manifest) => {
      if (!manifest) return;
      return Promise.all(Object.entries(roles).filter(([role]) => manifest[role]).map(([role, [size, place]]) =>
        loader.loadAsync('/models/' + manifest[role]).then((gltf) => {
          if (gltf.animations?.length) {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach((a) => mixer.clipAction(a).play());
            mixers.push(mixer);
          }
          place(fitInto(gltf.scene, size));
          onEach?.(role);
        }).catch(() => { /* segue com a reserva */ })));
    })
    .catch(() => {});

  return { ready, update(dt) { mixers.forEach((m) => m.update(dt)); } };
}
