/* Objeto característico de cada sistema (S.kind). Cada construtor devolve
   { group, update(t, camera) }. Itens marcados com userData.fallback são
   escondidos quando um modelo glTF assume o lugar. */
import * as THREE from 'three';
import { createHomeworld } from './homeworld.js';
import { buildPulsar } from './pulsar.js';

const builders = {
  prism(group) {
    const p = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.8)), new THREE.LineBasicMaterial({ color: 0xdfe6ee, transparent: true, opacity: 0.7 }));
    group.add(p);
    return (t) => { p.rotation.y = t * 0.4; p.rotation.x = Math.sin(t * 0.3) * 0.4; };
  },

  pulsar(group, star) { return buildPulsar(group, star); },

  /* enxame: milhares de sondas minúsculas em órbitas inclinadas, ondulando em bando (posição calculada na GPU) */
  swarm(group) {
    const N = 9000;
    const seed = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      const g = (Math.random() + Math.random() + Math.random()) / 3;      /* concentra no meio do anel */
      seed.set([Math.random() * Math.PI * 2, 1.5 + g * 2.4, (Math.random() - 0.5) * 1.3, 0.35 + Math.random() * 0.9], i * 4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute('seed', new THREE.BufferAttribute(seed, 4));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: Math.min(devicePixelRatio, 1.75) } },
      vertexShader: /* glsl */`
        attribute vec4 seed; uniform float uTime, uPx; varying float vA;
        void main() {
          float a = seed.x + uTime * seed.w * 0.6;
          float r = seed.y + sin(uTime * 0.7 + seed.x * 3.0) * 0.22;
          vec3 p = vec3(cos(a) * r, 0.0, sin(a) * r);
          p = vec3(p.x, p.z * sin(seed.z), p.z * cos(seed.z));
          p += 0.16 * vec3(sin(uTime * 1.3 + seed.x * 7.0), sin(uTime * 1.7 + seed.y * 9.0), cos(uTime * 1.1 + seed.z * 11.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = clamp(uPx * (16.0 / -mv.z), 1.3, 2.6 * uPx);
          vA = 0.55 + 0.45 * sin(uTime * 3.0 + seed.x * 20.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        varying float vA;
        void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(1.0, 0.78, 0.4, smoothstep(0.5, 0.05, d) * vA); }`
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    group.add(points);
    return (t) => { mat.uniforms.uTime.value = t; group.rotation.y = t * 0.05; };
  },

  shield(group) {
    const sh = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.2, 1)), new THREE.LineBasicMaterial({ color: 0x3fd1c4, transparent: true, opacity: 0.55 }));
    group.add(sh);
    return (t) => { sh.rotation.y = t * 0.25; sh.material.opacity = 0.35 + Math.sin(t * 2) * 0.15; };
  },

  neutron(group) {
    const m = new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.6 });
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.05, 8, 80), m);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.04, 8, 80), m);
    group.add(r1, r2);
    return (t) => { r1.rotation.set(t * 0.9, t * 0.4, 0); r2.rotation.set(0, t * 0.6, t * 0.8); };
  },

  /* reserva procedural: o olho encara a câmera */
  eye(group) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 24), new THREE.MeshStandardMaterial({ color: 0xe9dccb, roughness: 0.4, emissive: 0x401010, emissiveIntensity: 0.4 }));
    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), new THREE.MeshBasicMaterial({ color: 0x7a1010 }));
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    iris.position.z = 1.41; pupil.position.z = 1.42;
    ball.add(iris, pupil);
    ball.userData.fallback = true;
    group.add(ball);
    return (t, camera) => group.lookAt(camera.position);
  },

  crystal(group) {
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(1.5).scale(0.6, 1.6, 0.6), new THREE.MeshStandardMaterial({ color: 0x2a1a44, roughness: 0.15, metalness: 0.6, emissive: 0x5a2aa0, emissiveIntensity: 0.6 }));
    c.userData.fallback = true;
    group.add(c);
    return (t) => { group.rotation.y = t * 0.3; };
  },

  /* planeta natal com lua; aceita texturas realistas depois (api.useTextures) */
  origin(group, star, center) {
    const world = createHomeworld(group, center);
    return { update: world.update, api: world };
  }
};

/* um construtor devolve a função de update ou { update, api } */
export function buildProp(kind, star, center = new THREE.Vector3()) {
  const group = new THREE.Group();
  const built = builders[kind] ? builders[kind](group, star, center) : null;
  const update = typeof built === 'function' ? built : built?.update;
  return {
    group,
    api: built?.api ?? null,
    update: update || (() => {}),
    /* troca a reserva procedural por um modelo */
    replaceWith(obj) {
      group.children.forEach((c) => { if (c.userData.fallback) c.visible = false; });
      group.add(obj);
    }
  };
}
