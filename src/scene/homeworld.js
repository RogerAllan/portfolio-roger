/* Planeta natal (sistema "Sobre mim"): mundo vivo com lua.
   Sem texturas: shader procedural (planets.js). Com texturas (albedo, nuvens e
   máscara de água): iluminação da estrela com terminador suave, brilho
   especular do sol só no oceano, nuvens numa camada própria que gira um pouco
   mais rápido e projeta sombra leve na superfície, e espalhamento na borda. */
import * as THREE from 'three';
import { planetMaterial, atmosphere, PRESETS, HOMEWORLD } from './planets.js';

const RADIUS = 2.0;
const POS = new THREE.Vector3(-6.5, 1.5, -6.0);   /* afastado do sol, atrás e à direita dele: a câmera vê o lado iluminado */

const surfaceShader = {
  vertexShader: /* glsl */`
    varying vec2 vUv; varying vec3 vN; varying vec3 vW;
    void main() {
      vUv = uv;
      vec4 w = modelMatrix * vec4(position, 1.0);
      vW = w.xyz;
      vN = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */`
    uniform sampler2D uAlbedo, uWater, uClouds;
    uniform vec3 uLight, uAtm; uniform float uTime, uCloudShift;
    varying vec2 vUv; varying vec3 vN; varying vec3 vW;
    void main() {
      vec3 N = normalize(vN), L = normalize(uLight - vW), V = normalize(cameraPosition - vW);
      float nl = dot(N, L);
      float day = smoothstep(-0.06, 0.3, nl);
      vec3 albedo = texture2D(uAlbedo, vUv).rgb;
      float water = texture2D(uWater, vUv).r;
      float shadow = texture2D(uClouds, vUv + vec2(uCloudShift - 0.004, 0.002)).a;
      vec3 col = albedo * (0.035 + 1.1 * day * max(nl, 0.0) + 0.25 * day);
      col *= 1.0 - shadow * 0.35 * day;
      /* reflexo do sol no oceano */
      vec3 H = normalize(L + V);
      float spec = pow(max(dot(N, H), 0.0), 70.0) * water * day;
      col += vec3(1.0, 0.92, 0.78) * spec * 0.9;
      /* lado noturno com um azul muito fraco + espalhamento na borda */
      col += vec3(0.01, 0.02, 0.04) * (1.0 - day);
      col += uAtm * pow(1.0 - max(dot(N, V), 0.0), 3.0) * (0.15 + 0.7 * day);
      gl_FragColor = vec4(col, 1.0);
    }`
};

const cloudShader = {
  vertexShader: surfaceShader.vertexShader,
  fragmentShader: /* glsl */`
    uniform sampler2D uClouds; uniform vec3 uLight; uniform float uCloudShift;
    varying vec2 vUv; varying vec3 vN; varying vec3 vW;
    void main() {
      vec3 N = normalize(vN), L = normalize(uLight - vW);
      float day = smoothstep(-0.06, 0.3, dot(N, L));
      float a = texture2D(uClouds, vUv + vec2(uCloudShift, 0.0)).a;
      gl_FragColor = vec4(vec3(0.95) * (0.05 + 0.95 * day), a * (0.35 + 0.65 * day));
    }`
};

function loadTexture(url) {
  return new Promise((ok, fail) => new THREE.TextureLoader().load(url, (t) => {
    t.wrapS = THREE.RepeatWrapping;
    t.anisotropy = 4;
    ok(t);
  }, undefined, fail));
}

export function createHomeworld(group, center) {
  const home = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 96, 64), planetMaterial(HOMEWORLD, 4.2, center));
  home.position.copy(POS);
  home.rotation.z = 0.35;
  home.add(atmosphere(RADIUS, HOMEWORLD, center, 1.3));
  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.55, 40, 28), planetMaterial(PRESETS[3], 9.1, center));
  group.add(home, moon);

  let clouds = null, textured = null;

  return {
    /* troca o procedural pelas texturas realistas, se carregarem */
    async useTextures({ albedo, clouds: cloudUrl, water }) {
      try {
        const [a, c, w] = await Promise.all([loadTexture(albedo), loadTexture(cloudUrl), loadTexture(water)]);
        const uniforms = {
          uAlbedo: { value: a }, uWater: { value: w }, uClouds: { value: c },
          uLight: { value: center.clone() }, uAtm: { value: new THREE.Color(HOMEWORLD.atm) },
          uTime: { value: 0 }, uCloudShift: { value: 0 }
        };
        home.material.dispose();
        home.material = textured = new THREE.ShaderMaterial({ ...surfaceShader, uniforms });
        clouds = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.012, 96, 64), new THREE.ShaderMaterial({
          ...cloudShader, transparent: true, depthWrite: false,
          uniforms: { uClouds: uniforms.uClouds, uLight: uniforms.uLight, uCloudShift: uniforms.uCloudShift }
        }));
        home.add(clouds);
      } catch { /* mantém o procedural */ }
    },
    update(t) {
      home.rotation.y = t * 0.05;
      if (textured) textured.uniforms.uCloudShift.value = t * 0.0025;
      else home.material.uniforms.uTime.value = t;
      moon.material.uniforms.uTime.value = t;
      moon.position.set(POS.x + Math.cos(t * 0.18) * 3.6, 0.9 + Math.sin(t * 0.18) * 0.6, POS.z + Math.sin(t * 0.18) * 3.6);
    }
  };
}
