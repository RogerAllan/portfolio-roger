/* Pulsar: estrela de nêutrons girando rápido, com magnetosfera inclinada em
   relação ao eixo de rotação. Os jatos gêmeos saem dos polos magnéticos e
   varrem o espaço como um farol; quando um deles passa pela câmera, a estrela
   lampeja. Linhas de campo em laço com pulsos de luz e um vento de partículas
   escoando pelo equador. */
import * as THREE from 'three';

const TILT = 0.55;            /* ângulo entre eixo magnético e eixo de rotação */
const SPIN = 2.4;             /* rad/s */
const JET_LEN = 11;

const NOISE2 = /* glsl */`
  float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n2(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
`;

/* jato: cone aberto com filamentos correndo para fora e bordas que se dissolvem */
function jet(material) {
  const geo = new THREE.ConeGeometry(1.05, JET_LEN, 48, 40, true);
  geo.translate(0, -JET_LEN / 2, 0);                  /* ápice na estrela */
  return new THREE.Mesh(geo, material);
}

const jetMaterial = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { uTime: { value: 0 }, uFlash: { value: 0 } },
  vertexShader: /* glsl */`
    varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main() {
      vUv = uv;
      vec4 w = modelMatrix * vec4(position, 1.0);
      vN = normalize(mat3(modelMatrix) * normal);
      vV = normalize(cameraPosition - w.xyz);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */`
    uniform float uTime, uFlash; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    ${NOISE2}
    void main() {
      float along = vUv.y;                                   /* 1 no ápice, 0 na ponta */
      float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
      float streak = n2(vec2(vUv.x * 18.0, along * 9.0 + uTime * 7.0)) * 0.6 + n2(vec2(vUv.x * 40.0, along * 22.0 + uTime * 12.0)) * 0.4;
      float core = pow(along, 2.2);
      float a = (core * 0.9 + streak * core * 0.8) * edge * (0.55 + uFlash * 0.9);
      vec3 c = mix(vec3(0.35, 0.75, 1.0), vec3(0.92, 0.98, 1.0), core);
      gl_FragColor = vec4(c, a);
    }`
});

/* uma linha de campo dipolar: r = L · sin²θ no plano de longitude phi */
function fieldLine(L, phi, material) {
  const pts = [], u = [];
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const th = 0.12 * Math.PI + (i / n) * 0.76 * Math.PI;
    const r = L * Math.pow(Math.sin(th), 2);
    pts.push(new THREE.Vector3(r * Math.sin(th) * Math.cos(phi), r * Math.cos(th), r * Math.sin(th) * Math.sin(phi)));
    u.push(i / n);
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  geo.setAttribute('u', new THREE.Float32BufferAttribute(u, 1));
  return new THREE.Line(geo, material);
}

const fieldMaterial = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */`attribute float u; varying float vU; void main() { vU = u; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform float uTime; varying float vU;
    void main() {
      float pulse = pow(fract(vU * 2.0 - uTime * 0.6), 10.0);
      float base = 0.08 + 0.1 * sin(vU * 3.14159);
      gl_FragColor = vec4(0.5, 0.82, 1.0, base + pulse * 0.85);
    }`
});

/* vento: partículas que nascem perto da estrela e escoam pelo plano equatorial */
function wind() {
  const N = 1800;
  const seed = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) seed.set([Math.random() * Math.PI * 2, Math.random(), 0.25 + Math.random() * 0.5], i * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 3));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: Math.min(devicePixelRatio, 1.75) } },
    vertexShader: /* glsl */`
      attribute vec3 seed; uniform float uTime, uPx; varying float vA;
      void main() {
        float life = fract(seed.y + uTime * seed.z * 0.25);
        float r = 1.1 + life * 4.2;
        float a = seed.x + life * 0.8;
        vec3 p = vec3(cos(a) * r, sin(seed.x * 13.0) * 0.12 * life, sin(a) * r);
        vA = sin(life * 3.14159) * 0.6;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp(uPx * (14.0 / -mv.z), 1.0, 2.5 * uPx);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`varying float vA; void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(0.6, 0.85, 1.0, smoothstep(0.5, 0.1, d) * vA); }`
  });
  const p = new THREE.Points(geo, mat);
  p.frustumCulled = false;
  return p;
}

export function buildPulsar(group, star) {
  const spin = new THREE.Group();                 /* gira em torno do eixo de rotação (Y) */
  const magnet = new THREE.Group();               /* inclinado: eixo magnético */
  magnet.rotation.z = TILT;
  spin.add(magnet);
  group.add(spin);

  const jm = jetMaterial();
  const up = jet(jm), down = jet(jm);
  down.rotation.z = Math.PI;
  magnet.add(up, down);

  const fm = fieldMaterial();
  [1.9, 2.8].forEach((L) => { for (let k = 0; k < 6; k++) magnet.add(fieldLine(L, (k / 6) * Math.PI * 2 + L, fm)); });

  const w = wind();
  group.add(w);

  const axis = new THREE.Vector3(), toCam = new THREE.Vector3(), center = new THREE.Vector3();

  return (t, camera) => {
    spin.rotation.y = t * SPIN;
    jm.uniforms.uTime.value = t;
    fm.uniforms.uTime.value = t;
    w.material.uniforms.uTime.value = t;
    /* lampejo: o quanto um dos jatos aponta para a câmera */
    axis.set(0, 1, 0).applyQuaternion(magnet.getWorldQuaternion(new THREE.Quaternion()));
    group.getWorldPosition(center);
    toCam.copy(camera.position).sub(center).normalize();
    const flash = Math.pow(Math.abs(axis.dot(toCam)), 24);
    jm.uniforms.uFlash.value = flash;
    star.scale.setScalar(0.75 + flash * 0.6);
  };
}
