/* Superfície procedural dos planetas (shader): cada técnica vira um mundo com
   tipo, paleta e semente próprios. Luz vem da estrela do sistema (uLight),
   com terminador suave e atmosfera na borda. Tipos:
   0 rochoso com crateras · 1 gigante gasoso em faixas · 2 gelo rachado
   3 lava/infectado com veios incandescentes · 4 oceano com continentes e nuvens
   Com mapa (applyMap): textura equirretangular no lugar do procedural, com
   rotação e tom próprios por planeta, mesma luz e atmosfera. */
import * as THREE from 'three';

const c = (h) => new THREE.Color(h);

export const PRESETS = [
  { type: 0, c1: 0x5b4a3e, c2: 0x9a8a76, c3: 0x221a15, atm: 0xc9a27a },   /* rochoso ferrugem */
  { type: 1, c1: 0x6e3f1c, c2: 0xd9a15c, c3: 0xf3dcb1, atm: 0xffb547 },   /* gasoso âmbar */
  { type: 2, c1: 0xe6eef6, c2: 0x5d7fa0, c3: 0x2c4058, atm: 0x9fd8ff },   /* gelo */
  { type: 0, c1: 0x34363c, c2: 0x8b8f96, c3: 0x15161a, atm: 0x9fb3c8 },   /* rochoso cinza */
  { type: 1, c1: 0x261744, c2: 0x7b5ea8, c3: 0xcab8ea, atm: 0xb48cff },   /* gasoso violeta */
  { type: 4, c1: 0x0d3236, c2: 0x4d5a2c, c3: 0x0a1d20, atm: 0x3fd1c4 },   /* oceano doente */
  { type: 3, c1: 0x1a0907, c2: 0xff5a1f, c3: 0x3a120a, atm: 0xff3b1a },   /* lava */
  { type: 1, c1: 0x2a3640, c2: 0x8fa6b8, c3: 0xdfe6ee, atm: 0xbfd8ff }    /* gasoso frio */
];
/* planeta natal da Origem: oceano profundo, continentes verde-ocre, atmosfera clara */
export const HOMEWORLD = { type: 4, c1: 0x1d4f73, c2: 0x6f8c3a, c3: 0x0b2a44, atm: 0x9fd0ff };
export const INFECTED = { type: 3, c1: 0x120507, c2: 0xe0242b, c3: 0x2a0a10, atm: 0xe0242b };

const vertexShader = /* glsl */`
  varying vec3 vN; varying vec3 vW; varying vec3 vP; varying vec2 vUv;
  void main() {
    vP = position;
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;

const fragmentShader = /* glsl */`
  uniform vec3 uLight, uC1, uC2, uC3, uAtm;
  uniform float uType, uSeed, uHot, uTime;
  uniform sampler2D uMap; uniform float uUseMap, uRot, uMapGlow, uDrift; uniform vec3 uTint;
  varying vec3 vN; varying vec3 vW; varying vec3 vP; varying vec2 vUv;

  float h(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float n3(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * n3(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }

  void main() {
    vec3 s = normalize(vP);
    vec3 p = s * 2.0 + uSeed;
    float n = fbm(p * 1.6);
    vec3 col; float glow = 0.0;

    if (uUseMap > 0.5) {               /* textura */
      vec3 t = texture2D(uMap, vUv + vec2(uRot + uTime * uDrift, 0.0)).rgb;
      col = t * uTint;
      if (uMapGlow > 0.0) {            /* lava: pixels quentes acendem e pulsam */
        float hot = smoothstep(0.18, 0.5, t.r - t.b) * smoothstep(0.35, 0.7, t.r);
        glow = hot * uMapGlow * (0.75 + 0.25 * sin(uTime * 2.0 + uSeed));
      }
    } else if (uType < 0.5) {          /* rochoso */
      col = mix(uC1, uC2, smoothstep(0.35, 0.7, n));
      col *= 0.78 + 0.45 * fbm(p * 5.0);
      float k = fbm(p * 6.5 + 3.1);
      float rimC = smoothstep(0.60, 0.63, k) - smoothstep(0.63, 0.70, k);
      col = mix(col, uC3, smoothstep(0.66, 0.72, k) * 0.7);
      col += rimC * 0.18;
    } else if (uType < 1.5) {          /* gigante gasoso */
      float b = s.y * 9.0 + fbm(p * 1.3 + vec3(uTime * 0.03, 0.0, 0.0)) * 3.2;
      col = mix(uC1, uC2, sin(b) * 0.5 + 0.5);
      col = mix(col, uC3, smoothstep(0.62, 0.9, fbm(p * 2.6 + vec3(0.0, uTime * 0.02, 0.0))) * 0.6);
      float storm = 1.0 - smoothstep(0.0, 0.18, length(s - normalize(vec3(0.6, -0.25, 0.75))));
      col = mix(col, uC3 * 1.1, storm * 0.8);
    } else if (uType < 2.5) {          /* gelo */
      float crack = abs(fbm(p * 3.2) - 0.5);
      col = mix(uC2, uC1, smoothstep(0.0, 0.05, crack));
      col = mix(col, uC3, smoothstep(0.55, 0.8, fbm(p * 1.2)) * 0.35);
      col *= 0.88 + 0.25 * n;
    } else if (uType < 3.5) {          /* lava / infectado */
      float v = 1.0 - smoothstep(0.0, 0.045, abs(fbm(p * 2.4 + vec3(0.0, uTime * 0.04, 0.0)) - 0.5));
      col = mix(uC1, uC3, n);
      glow = v * (0.75 + 0.25 * sin(uTime * 2.0 + uSeed));
      col = mix(col, uC2, glow);
    } else {                           /* oceano */
      float land = smoothstep(0.5, 0.53, n);
      col = mix(uC1, uC2, land);
      col = mix(col, uC3, (1.0 - land) * smoothstep(0.35, 0.2, n));
      float cl = smoothstep(0.55, 0.78, fbm(p * 2.2 + vec3(uTime * 0.04, 0.0, 0.0)));
      col = mix(col, vec3(0.82, 0.86, 0.9), cl * 0.75);
    }

    vec3 N = normalize(vN), L = normalize(uLight - vW), V = normalize(cameraPosition - vW);
    float diff = smoothstep(-0.12, 0.65, dot(N, L));
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    vec3 outc = col * (0.05 + 1.15 * diff) + uAtm * rim * (0.2 + 0.9 * diff) + uC2 * glow * 1.4;
    outc += uHot * (vec3(1.0, 0.71, 0.28) * 0.18 + rim * vec3(1.0, 0.7, 0.3) * 1.2);
    gl_FragColor = vec4(outc, 1.0);
  }`;

const BLANK = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
BLANK.needsUpdate = true;

export function planetMaterial(preset, seed, lightPos) {
  return new THREE.ShaderMaterial({
    vertexShader, fragmentShader,
    uniforms: {
      uLight: { value: lightPos.clone() },
      uC1: { value: c(preset.c1) }, uC2: { value: c(preset.c2) }, uC3: { value: c(preset.c3) }, uAtm: { value: c(preset.atm) },
      uType: { value: preset.type }, uSeed: { value: seed }, uHot: { value: 0 }, uTime: { value: 0 },
      uMap: { value: BLANK }, uUseMap: { value: 0 }, uRot: { value: 0 }, uMapGlow: { value: 0 }, uDrift: { value: 0 },
      uTint: { value: new THREE.Color(1, 1, 1) }
    }
  });
}

/* Mapas de superfície: kind -> tipo (densidade da atmosfera) */
const KIND_TYPE = { rocky: 0, gas: 1, ice: 2, lava: 3, ocean: 4 };

/* cor média da textura, usada para tingir a atmosfera */
function averageColor(tex) {
  try {
    const cv = document.createElement('canvas');
    cv.width = 16; cv.height = 8;
    const g = cv.getContext('2d');
    g.drawImage(tex.image, 0, 0, 16, 8);
    const d = g.getImageData(0, 4 - 2, 16, 4).data;   /* faixa do equador */
    let r = 0, gg = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4;
    return new THREE.Color(r / n / 255, gg / n / 255, b / n / 255);
  } catch { return new THREE.Color(0.6, 0.7, 0.8); }
}

/* aplica um mapa ao planeta (mesh com planetMaterial e atmosfera filha) */
export function applyMap(mesh, { tex, kind }, rnd) {
  const u = mesh.material.uniforms;
  const type = KIND_TYPE[kind] ?? 0;
  u.uMap.value = tex;
  u.uUseMap.value = 1;
  u.uType.value = type;
  u.uRot.value = rnd();
  u.uDrift.value = kind === 'gas' ? 0.004 : 0;
  u.uMapGlow.value = kind === 'lava' ? 1 : 0;
  if (kind === 'lava') u.uC2.value.set(0xff5a1f);
  /* tom levemente deslocado, para repetições não ficarem idênticas */
  const tint = new THREE.Color().setHSL(rnd(), 0.5, 0.5);
  u.uTint.value.setRGB(1, 1, 1).lerp(tint, 0.12).multiplyScalar(0.95 + rnd() * 0.15);
  if (!tex.userData.avg) tex.userData.avg = averageColor(tex);
  const hsl = {};
  const atm = tex.userData.avg.clone();
  atm.getHSL(hsl);
  atm.setHSL(hsl.h, Math.min(1, hsl.s * 1.4 + 0.15), Math.min(0.75, hsl.l * 1.3 + 0.25));
  u.uAtm.value.copy(atm);
  const shell = mesh.children.find((ch) => ch.material?.uniforms?.uDensity);
  if (shell) {
    shell.material.uniforms.uAtm.value.copy(atm);
    shell.material.uniforms.uDensity.value = ATMO_BY_TYPE[type];
  }
}

/* Atmosfera: casca fina renderizada por trás (BackSide), aditiva.
   Brilha colada à borda do planeta e se dissolve até a borda da casca; o lado voltado para a
   estrela fica mais aceso. Densidade por tipo: gasosos e oceânicos espessos,
   gelo e lava médios, rochosos finos. */
const ATMO_BY_TYPE = [0.45, 1.0, 0.7, 0.75, 0.95];

const atmoVertex = /* glsl */`
  varying vec3 vNv; varying vec3 vNw; varying vec3 vW;
  void main() {
    vNv = normalize(normalMatrix * normal);
    vNw = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;

const atmoFragment = /* glsl */`
  uniform vec3 uAtm, uLight; uniform float uDensity, uLimb;
  varying vec3 vNv; varying vec3 vNw; varying vec3 vW;
  void main() {
    /* 0 na borda externa da casca, 1 rente ao planeta: queda suave, sem anel */
    float x = clamp(-vNv.z / uLimb, 0.0, 1.0);
    float halo = x * x * x * x;                                  /* colado à borda, some rápido para fora */
    float day = smoothstep(-0.35, 0.55, dot(normalize(vNw), normalize(uLight - vW)));
    gl_FragColor = vec4(uAtm, halo * uDensity * (0.06 + 0.94 * day) * 0.8);
  }`;

export function atmosphere(radius, preset, lightPos, density) {
  const d = density ?? ATMO_BY_TYPE[preset.type] ?? 0.6;
  const k = 1.06 + d * 0.06;                                   /* casca / planeta: atmosfera fina */
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius * k, 48, 32),
    new THREE.ShaderMaterial({
      vertexShader: atmoVertex, fragmentShader: atmoFragment,
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uAtm: { value: c(preset.atm) }, uLight: { value: lightPos.clone() }, uDensity: { value: d }, uLimb: { value: Math.sqrt(1 - 1 / (k * k)) } }
    })
  );
  mesh.raycast = () => {};   /* não atrapalha o clique no planeta */
  return mesh;
}
