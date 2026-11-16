/* Núcleo da galáxia: buraco negro com horizonte de eventos animado, anel de
   fótons e halo de lente gravitacional; disco de acreção; anel de quarentena;
   destroços espiralando para dentro. Tem luz própria para iluminar a cena.
   `pulse()` (golpes nas anomalias) esquenta tudo por um instante. */
import * as THREE from 'three';
import { glowSprite, ringPoints } from './util.js';
import { createDebris } from './debris.js';

const R = 3;   /* raio do horizonte de eventos */

const NOISE = /* glsl */`
  float h3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float n3(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * n3(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }
`;

/* horizonte: redemoinho escuro por dentro + anel de fótons na borda (mais forte de um lado) */
const horizonShader = {
  vertexShader: /* glsl */`
    varying vec3 vN; varying vec3 vV; varying vec3 vP;
    void main() {
      vP = position;
      vec4 w = modelMatrix * vec4(position, 1.0);
      vN = normalize(mat3(modelMatrix) * normal);
      vV = normalize(cameraPosition - w.xyz);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */`
    uniform float uTime, uHeat;
    varying vec3 vN; varying vec3 vV; varying vec3 vP;
    ${NOISE}
    void main() {
      vec3 N = normalize(vN), V = normalize(vV);
      float mu = max(dot(N, V), 0.0);
      /* coordenadas polares em volta do eixo de visão: o redemoinho gira e afunda */
      vec3 s = normalize(vP);
      float ang = atan(s.z, s.x);
      float depth = 1.0 - mu;
      float swirl = fbm(vec3(ang * 2.0 + uTime * 0.35 + depth * 5.0, depth * 6.0 - uTime * 0.6, uTime * 0.05));
      float veins = smoothstep(0.42, 0.8, swirl) * (0.25 + depth);
      float deep = fbm(vec3(ang * 4.0 - uTime * 0.5 + depth * 9.0, depth * 3.0 + uTime * 0.3, 2.0));
      vec3 inside = vec3(0.015, 0.005, 0.012)
        + vec3(0.6, 0.12, 0.06) * veins * (0.55 + uHeat)
        + vec3(0.22, 0.06, 0.32) * smoothstep(0.5, 0.85, deep) * (1.0 - depth) * 0.6;
      /* anel de fótons: borda fina e brilhante, Doppler deixa um lado mais forte */
      float ring = pow(1.0 - mu, 4.0);
      float doppler = 0.55 + 0.45 * dot(N, normalize(vec3(1.0, 0.15, 0.0)));
      float flick = 0.8 + 0.2 * fbm(vec3(ang * 6.0, uTime * 1.5, 0.0));
      vec3 photon = mix(vec3(1.0, 0.55, 0.2), vec3(1.0, 0.92, 0.75), doppler) * ring * doppler * flick * (3.2 + uHeat * 2.0);
      gl_FragColor = vec4(inside + photon, 1.0);
    }`
};

/* halo de lente: anel fino que tremula em volta do horizonte, sempre de frente */
const lensShader = {
  vertexShader: /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform float uTime, uHeat, uInner;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      vec2 q = vUv - 0.5;
      float r = length(q) * 2.0;
      float a = atan(q.y, q.x);
      float band = exp(-pow((r - uInner * 1.07) / 0.05, 2.0));                  /* anel de Einstein */
      float wisps = fbm(vec3(cos(a) * 3.0, sin(a) * 3.0, r * 4.0 - uTime * 0.4)) * exp(-max(r - uInner, 0.0) * 6.0);
      float al = (band * 1.3 + wisps * 0.7) * step(uInner * 0.98, r) * smoothstep(1.0, 0.7, r);
      vec3 col = mix(vec3(1.0, 0.6, 0.3), vec3(0.95, 0.2, 0.15), uHeat);
      gl_FragColor = vec4(col * (1.0 + uHeat), al);
    }`
};

const diskShader = {
  vertexShader: /* glsl */`varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform float uTime, uHeat; varying vec3 vP;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1,0)), f.x), mix(h(i + vec2(0,1)), h(i + vec2(1,1)), f.x), f.y); }
    void main(){
      float r = length(vP.xy); float a = atan(vP.y, vP.x);
      float k = clamp((r - 3.6) / 8.0, 0.0, 1.0);
      float sw = n(vec2(a * 3.0 + uTime * 0.6 - r * 0.9, r * 1.4)) * 0.7 + n(vec2(a * 9.0 - uTime, r * 4.0)) * 0.3;
      vec3 hot = mix(vec3(1.0, 0.86, 0.6), vec3(0.95, 0.25, 0.08), k);
      hot = mix(hot, vec3(0.9, 0.05, 0.08), uHeat * 0.6);
      float al = (1.0 - k) * smoothstep(0.0, 0.08, k) * (0.35 + sw * 0.9);
      gl_FragColor = vec4(hot * (1.2 + uHeat), al);
    }`
};

export function createCore({ glow, pixelRatio = 1 }) {
  const group = new THREE.Group();

  const horizonMat = new THREE.ShaderMaterial({ ...horizonShader, uniforms: { uTime: { value: 0 }, uHeat: { value: 0 } } });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), horizonMat));

  const lensSize = R * 3.2;
  const lensMat = new THREE.ShaderMaterial({
    ...lensShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uHeat: { value: 0 }, uInner: { value: (R * 2) / lensSize } }
  });
  const lens = new THREE.Mesh(new THREE.PlaneGeometry(lensSize, lensSize), lensMat);
  group.add(lens);

  const diskMat = new THREE.ShaderMaterial({
    ...diskShader, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uHeat: { value: 0 } }
  });
  const disk = new THREE.Mesh(new THREE.RingGeometry(3.6, 11.5, 160, 4), diskMat);
  disk.rotation.x = -Math.PI / 2 + 0.28;
  group.add(disk);

  const halo = glowSprite(glow, 0xff6a2a, 0.55, 30);
  group.add(halo);

  const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints(15, 128)),
    new THREE.LineDashedMaterial({ color: 0xe0242b, dashSize: 1.4, gapSize: 1.1, transparent: true, opacity: 0.55 }));
  ring.computeLineDistances();
  group.add(ring);

  const debris = createDebris({ pixelRatio });
  group.add(debris.group);

  /* luz de brasa do disco + preenchimento frio de cima */
  const ember = new THREE.PointLight(0xff7a3a, 140, 70, 1.15);
  ember.position.set(0, 2, 0);
  const fill = new THREE.PointLight(0x9fb3c8, 60, 60, 1.3);
  fill.position.set(0, 18, 12);
  group.add(ember, fill);

  let heat = 0;

  return {
    group,
    pulse(a) { heat = Math.min(1, heat + a * 0.6); },
    update(t, dt, camera) {
      heat *= Math.pow(0.25, dt);
      for (const m of [horizonMat, lensMat, diskMat]) { m.uniforms.uTime.value = t; m.uniforms.uHeat.value = heat; }
      lens.quaternion.copy(camera.quaternion);
      ring.rotation.y = -t * 0.05;
      halo.material.opacity = 0.5 + heat * 0.4;
      ember.intensity = 140 + heat * 220;
      debris.update(t, dt, heat);
    }
  };
}
