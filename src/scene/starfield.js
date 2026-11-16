/* Galáxia espiral em partículas, estrelas de fundo e nebulosas. */
import * as THREE from 'three';
import { glowTexture } from './util.js';

const ARM_RADIUS = 72;

function spiralGalaxy(count, pixelRatio) {
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), seed = new Float32Array(count);
  const cCore = new THREE.Color(0xffc98a), cMid = new THREE.Color(0xa8325a), cEdge = new THREE.Color(0x5b6d9c), c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 0.72) * ARM_RADIUS;
    const scat = (Math.random() - 0.5) * (0.35 + r * 0.035) * 3;
    const a = (i % 3) * (Math.PI * 2 / 3) + r * 0.085 + scat * 0.12;
    pos[i * 3] = Math.cos(a) * r + (Math.random() - 0.5) * r * 0.12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * Math.max(0.4, 4.2 * (1 - r / 80)) * Math.random();
    pos[i * 3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * r * 0.12;
    const k = r / ARM_RADIUS;
    c.copy(cCore).lerp(cMid, Math.min(1, k * 1.8));
    if (k > 0.5) c.lerp(cEdge, (k - 0.5) * 2);
    if (Math.random() < 0.04) c.set(0xe0242b);
    col.set([c.r, c.g, c.b], i * 3);
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: { uTime: { value: 0 }, uPx: { value: pixelRatio } },
    vertexShader: /* glsl */`
      attribute float seed; uniform float uTime, uPx; varying vec3 vC; varying float vA;
      void main() {
        vC = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp((0.9 + seed * 1.8) * uPx * (150.0 / -mv.z), 1.2, 3.5 * uPx);
        vA = 0.55 + 0.45 * sin(uTime * (0.6 + seed * 2.0) + seed * 40.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vC; varying float vA;
      void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vC * 1.25, smoothstep(0.5, 0.0, d) * vA); }`
  });
  return new THREE.Points(geo, mat);
}

function backgroundStars(count) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(420 + Math.random() * 200);
    pos.set([v.x, v.y, v.z], i * 3);
  }
  return new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)),
    new THREE.PointsMaterial({ color: 0x9aa6bd, size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0.6, fog: false }));
}

function nebulae(urls) {
  const group = new THREE.Group();
  const textured = urls.length > 0;
  const waits = [];
  const maps = textured ? urls.map((u) => {
    let done;
    waits.push(new Promise((r) => { done = r; }));
    return new THREE.TextureLoader().load(u, (t) => { t.colorSpace = THREE.SRGBColorSpace; done(); }, undefined, () => done());
  }) : [glowTexture(3, 1)];
  const tints = [0x7a1530, 0x3b1f6e, 0x2a3b55, 0x8a2a1a];
  for (let i = 0; i < 16; i++) {
    const r = 12 + Math.random() * 54;
    const a = (i % 3) * (Math.PI * 2 / 3) + r * 0.085 + (Math.random() - 0.5) * 0.6;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: maps[i % maps.length], color: textured ? 0xffffff : tints[i % 4], transparent: true,
      opacity: (textured ? 0.14 : 0.28) + Math.random() * (textured ? 0.16 : 0.25),
      depthWrite: false, blending: THREE.AdditiveBlending, rotation: Math.random() * 6
    }));
    s.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 3, Math.sin(a) * r);
    s.scale.setScalar(26 + Math.random() * 40);
    group.add(s);
  }
  return { group, ready: Promise.all(waits) };
}

export function createStarfield({ small, pixelRatio, nebulaUrls = [] }) {
  const group = new THREE.Group();
  const galaxy = spiralGalaxy(small ? 12000 : 26000, pixelRatio);
  const neb = nebulae(nebulaUrls);
  group.add(galaxy, backgroundStars(2600), neb.group);
  return {
    group,
    ready: neb.ready,
    update(t) {
      galaxy.material.uniforms.uTime.value = t;
      galaxy.rotation.y = t * 0.004;
    }
  };
}
