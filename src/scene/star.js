/* Estrela procedural: superfície de plasma (granulação animada, manchas e
   escurecimento de borda) + coroa com filamentos, sempre de frente para a câmera.
   A cor vem do sistema (S.star). */
import * as THREE from 'three';

const NOISE = /* glsl */`
  float h3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float n3(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * n3(p); p = p * 2.07 + 3.1; a *= 0.5; } return s; }
`;

const surface = {
  vertexShader: /* glsl */`
    varying vec3 vP; varying vec3 vN; varying vec3 vV;
    void main() {
      vP = position;
      vec4 w = modelMatrix * vec4(position, 1.0);
      vN = normalize(mat3(modelMatrix) * normal);
      vV = normalize(cameraPosition - w.xyz);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */`
    uniform vec3 uColor; uniform float uTime, uSeed;
    varying vec3 vP; varying vec3 vN; varying vec3 vV;
    ${NOISE}
    void main() {
      vec3 s = normalize(vP) * 2.4 + uSeed;
      float gran = fbm(s * 3.2 + vec3(0.0, uTime * 0.12, uTime * 0.07));
      float flow = fbm(s * 1.1 - vec3(uTime * 0.04, 0.0, 0.0));
      float spots = smoothstep(0.62, 0.72, fbm(s * 0.9 + 7.0));
      float mu = max(dot(normalize(vN), normalize(vV)), 0.0);
      float limb = 0.35 + 0.65 * pow(mu, 0.45);
      vec3 hot = mix(uColor * 1.9 + 0.35, vec3(1.0), 0.25);
      vec3 col = mix(uColor * 0.55, hot, smoothstep(0.3, 0.75, gran * 0.7 + flow * 0.5));
      col *= 1.0 - spots * 0.55;
      col *= limb;
      col += uColor * pow(1.0 - mu, 3.0) * 0.8;   /* borda acesa */
      gl_FragColor = vec4(col, 1.0);
    }`
};

const corona = {
  vertexShader: /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform vec3 uColor; uniform float uTime, uSeed, uInner;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      vec2 q = vUv - 0.5;
      float r = length(q) * 2.0;
      float a = atan(q.y, q.x);
      if (r > 1.0) discard;
      float rays = fbm(vec3(cos(a) * 2.2, sin(a) * 2.2, r * 1.6 - uTime * 0.25 + uSeed));
      float fil = pow(rays, 2.2) * 2.6;
      float edge = max(r - uInner, 0.0) / (1.0 - uInner);
      float glow = exp(-edge * 4.0) * 0.9 + fil * pow(1.0 - edge, 2.0);
      glow *= smoothstep(1.0, 0.8, r) * step(uInner * 0.92, r);
      gl_FragColor = vec4(uColor * (1.2 + fil), glow);
    }`
};

export function createStar(color, radius = 0.8, seed = 0) {
  const c = new THREE.Color(color);
  const group = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), new THREE.ShaderMaterial({
    ...surface, uniforms: { uColor: { value: c }, uTime: { value: 0 }, uSeed: { value: seed } }
  }));
  const size = radius * 7;
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.ShaderMaterial({
    ...corona, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: c }, uTime: { value: 0 }, uSeed: { value: seed }, uInner: { value: (radius * 2) / size } }
  }));
  group.add(core, halo);

  return {
    group,
    update(t, camera) {
      core.material.uniforms.uTime.value = t;
      halo.material.uniforms.uTime.value = t;
      halo.quaternion.copy(camera.quaternion);   /* a coroa sempre de frente */
    }
  };
}
