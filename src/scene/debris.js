/* Destroços sendo desfeitos pelo buraco negro.
   Poucos fragmentos discretos caem em espiral lá fora; ao cruzar o raio de
   ruptura, cada um se desfaz numa nuvem de partículas (pool fixo, sem alocar)
   que segue a espiral cada vez mais rápida, esquenta, se espalha em fios ao
   longo da órbita e apaga no horizonte de eventos. `heat` (golpes nas
   anomalias) acelera a queda por um instante. */
import * as THREE from 'three';

const HORIZON = 3.2;          /* partículas apagam aqui */
const BREAK = 8.5;            /* fragmentos se desfazem aqui */
const SPAWN_MIN = 15, SPAWN_MAX = 26;
const PER_BREAK = 90;         /* partículas por fragmento */
const POOL = 6000;

const COLD = new THREE.Color(0x3d4048);
const WARM = new THREE.Color(0xc4552a);

/* ---------- fragmentos ---------- */
function spawnChunk(p, fresh) {
  p.r = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN) * (fresh ? Math.random() * 0.8 + 0.2 : 1);
  if (fresh) p.r = Math.max(p.r, BREAK + 1);
  p.a = Math.random() * Math.PI * 2;
  p.y = (Math.random() - 0.5) * 1.6;
  p.fall = 0.18 + Math.random() * 0.3;
  p.size = 0.05 + Math.pow(Math.random(), 2.5) * 0.22;
  p.spin = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(1.6);
  p.rot = new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6);
}

function chunkField(geometry, count) {
  const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.5 }), count);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  mesh.frustumCulled = false;
  const parts = Array.from({ length: count }, () => { const p = {}; spawnChunk(p, true); return p; });
  return { mesh, parts };
}

/* ---------- partículas ---------- */
function particlePool(pixelRatio) {
  const pos = new Float32Array(POOL * 3), heat = new Float32Array(POOL), alpha = new Float32Array(POOL);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('heat', new THREE.BufferAttribute(heat, 1));
  geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uPx: { value: pixelRatio } },
    vertexShader: /* glsl */`
      attribute float heat; attribute float alpha; uniform float uPx;
      varying float vHeat; varying float vAlpha;
      void main() {
        vHeat = heat; vAlpha = alpha;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp((0.6 + heat * 1.2) * uPx * (40.0 / -mv.z), 0.8, 3.0 * uPx);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying float vHeat; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        vec3 c = mix(vec3(0.75, 0.25, 0.1), vec3(1.0, 0.88, 0.7), vHeat);
        gl_FragColor = vec4(c, smoothstep(0.5, 0.0, d) * vAlpha);
      }`
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  const attrs = [geo.attributes.position, geo.attributes.heat, geo.attributes.alpha];
  /* estado de cada partícula: raio, ângulo, altura, velocidade; r < 0 = livre */
  const st = { r: new Float32Array(POOL).fill(-1), a: new Float32Array(POOL), y: new Float32Array(POOL), v: new Float32Array(POOL) };
  let cursor = 0;

  return {
    points,
    /* desfaz um fragmento em partículas ao redor da posição dele */
    burst(r, a, y, size) {
      const n = Math.round(PER_BREAK * (0.4 + size * 4));
      for (let k = 0; k < n; k++) {
        const i = cursor; cursor = (cursor + 1) % POOL;
        st.r[i] = r + (Math.random() - 0.5) * size * 3;
        st.a[i] = a + (Math.random() - 0.5) * size * 0.6;
        st.y[i] = y + (Math.random() - 0.5) * size * 2;
        st.v[i] = 0.5 + Math.random() * 0.9;
      }
    },
    update(dt, boost) {
      for (let i = 0; i < POOL; i++) {
        if (st.r[i] < 0) { alpha[i] = 0; continue; }
        const r = st.r[i];
        st.r[i] = r - st.v[i] * (0.4 + 5 / r) * boost * dt * 0.6;
        st.a[i] += (3.0 / Math.pow(Math.max(r, 0.5), 1.35)) * boost * dt;
        st.y[i] *= 1 - dt * 0.9;                                   /* cai no plano do disco */
        if (st.r[i] < HORIZON) { st.r[i] = -1; alpha[i] = 0; continue; }
        pos[i * 3] = Math.cos(st.a[i]) * st.r[i];
        pos[i * 3 + 1] = st.y[i];
        pos[i * 3 + 2] = Math.sin(st.a[i]) * st.r[i];
        const h = THREE.MathUtils.clamp((BREAK - st.r[i]) / (BREAK - HORIZON), 0, 1);
        heat[i] = h;
        alpha[i] = Math.min(1, (st.r[i] - HORIZON) / 0.8) * (0.35 + h * 0.5);
      }
      for (const a of attrs) a.needsUpdate = true;
    }
  };
}

export function createDebris({ pixelRatio = 1 } = {}) {
  const group = new THREE.Group();
  const chunks = chunkField(new THREE.IcosahedronGeometry(1, 0).scale(1, 0.55, 0.8), 45);
  const plates = chunkField(new THREE.BoxGeometry(1.6, 0.08, 0.9), 15);
  const dust = particlePool(pixelRatio);
  group.add(chunks.mesh, plates.mesh, dust.points);

  const d = new THREE.Object3D();
  const c = new THREE.Color();

  function step(f, t, dt, boost) {
    f.parts.forEach((p, i) => {
      p.r -= p.fall * (1 + 4 / p.r) * boost * dt;
      p.a += (1.8 / Math.pow(p.r, 1.2)) * boost * dt;
      p.y *= 1 - dt * 0.1;
      if (p.r < BREAK) { dust.burst(p.r, p.a, p.y, p.size); spawnChunk(p, false); }

      d.position.set(Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r);
      d.rotation.set(p.rot.x + t * p.spin.x, p.rot.y + t * p.spin.y, p.rot.z + t * p.spin.z);
      /* começa a rachar (encolher) pouco antes da ruptura */
      const crack = THREE.MathUtils.smoothstep(p.r, BREAK, BREAK + 1.5);
      d.scale.setScalar(p.size * (0.5 + 0.5 * crack));
      d.updateMatrix();
      f.mesh.setMatrixAt(i, d.matrix);
      c.copy(COLD).lerp(WARM, 1 - crack);
      f.mesh.setColorAt(i, c);
    });
    f.mesh.instanceMatrix.needsUpdate = true;
    f.mesh.instanceColor.needsUpdate = true;
  }

  return {
    group,
    update(t, dt, heat = 0) {
      const boost = 1 + heat * 2.5;
      step(chunks, t, dt, boost);
      step(plates, t, dt, boost);
      dust.update(dt, boost);
    }
  };
}
