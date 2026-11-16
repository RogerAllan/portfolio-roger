/* Sistemas estelares: estrela, anel de seleção, área de clique, planetas em
   órbita (um por técnica) e o objeto característico de cada sistema. */
import * as THREE from 'three';
import { ringLine } from './util.js';
import { planetMaterial, atmosphere, applyMap, PRESETS, INFECTED } from './planets.js';
import { buildProp } from './props.js';
import { createStar } from './star.js';

/* Visuais: os presets procedurais + os mapas de textura (quando houver),
   embaralhados com semente fixa e distribuídos em sequência por todos os
   planetas, para vizinhos nunca repetirem o mesmo visual. */
const MAP_SLOTS = 12;
function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffledLooks() {
  const looks = [...PRESETS.keys()].map((i) => ({ preset: i })).concat([...Array(MAP_SLOTS).keys()].map((i) => ({ map: i })));
  const r = seeded(1337);
  for (let i = looks.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [looks[i], looks[j]] = [looks[j], looks[i]]; }
  return looks;
}

function buildPlanets(S, si, count, isCore, origin, nextLook) {
  const planets = [];
  const orbits = new THREE.Group();
  const orbitMat = new THREE.LineBasicMaterial({ color: 0x8c8f96, transparent: true, opacity: 0.12 });
  for (let i = 0; i < count; i++) {
    const r = (isCore ? 20 : 4) + i * (isCore ? 2.2 : 1.35);
    const look = isCore ? null : nextLook();
    /* até o mapa carregar, o slot de textura usa um procedural qualquer */
    const preset = isCore ? (i % 2 ? INFECTED : PRESETS[3]) : PRESETS[look.preset ?? look.map % PRESETS.length];
    const size = isCore ? 0.85 : 0.34 + ((si + i) % 3) * 0.1;
    const m = new THREE.Mesh(new THREE.SphereGeometry(size, 48, 32), planetMaterial(preset, si * 7.3 + i * 3.1, origin));
    m.add(atmosphere(size, preset, origin));
    m.userData = { r, a: Math.random() * Math.PI * 2, w: (0.35 / Math.sqrt(r)) * (i % 2 ? 1 : 0.8), i, mapSlot: look?.map ?? -1, seed: si * 31 + i };
    planets.push(m);
    orbits.add(ringLine(r, orbitMat));
  }
  orbits.visible = false;
  return { planets, orbits };
}

export function createSystems({ systems, techCounts }) {
  const group = new THREE.Group();
  const byId = {};
  const hitTargets = [];
  const looks = shuffledLooks();
  let lookIdx = 0;
  const nextLook = () => looks[lookIdx++ % looks.length];

  systems.forEach((S, si) => {
    const g = new THREE.Group();
    g.position.set(S.pos[0], 0, S.pos[1]);
    group.add(g);
    const isCore = S.kind === 'quarantine';

    const starFx = isCore ? null : createStar(S.star, 0.9, si * 13.7);
    const star = starFx ? starFx.group : new THREE.Group();
    const ring = ringLine(isCore ? 17 : 2.8, new THREE.LineBasicMaterial({ color: S.star, transparent: true, opacity: 0.25 }));
    const hit = new THREE.Mesh(new THREE.SphereGeometry(isCore ? 9 : 4, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData.id = S.id;
    hitTargets.push(hit);

    const { planets, orbits } = buildPlanets(S, si, techCounts[S.id] || 0, isCore, g.position, nextLook);
    const prop = buildProp(S.kind, star, g.position);
    g.add(star, ring, hit, orbits, prop.group, ...planets);

    byId[S.id] = { S, g, star, starFx, ring, planets, orbits, prop, isCore };
  });

  return {
    group,
    byId,
    hitTargets,
    position: (id) => byId[id].g.position,
    showOrbits(id, on) { if (byId[id]) byId[id].orbits.visible = on; },
    /* maps: [{ tex, kind }] já carregados; slots além da lista ficam procedurais */
    usePlanetMaps(maps) {
      if (!maps.length) return;
      for (const id in byId) for (const p of byId[id].planets) {
        const slot = p.userData.mapSlot;
        if (slot >= 0 && maps[slot % maps.length] && slot < maps.length) applyMap(p, maps[slot], seeded(p.userData.seed));
      }
    },
    update(t, dt, { camera, hover, current, planetHover }) {
      const k = Math.min(1, dt * 8);
      for (const id in byId) {
        const s = byId[id];
        const on = id === hover || id === current;
        s.ring.material.opacity += ((on ? 0.9 : 0.22) - s.ring.material.opacity) * Math.min(1, dt * 6);
        s.ring.rotation.y = t * 0.1;
        s.prop.update(t, camera);
        if (s.starFx && s.star.visible) s.starFx.update(t, camera);
        for (const p of s.planets) {
          const u = p.userData;
          u.a += u.w * dt;
          p.position.set(Math.cos(u.a) * u.r, Math.sin(u.a * 2) * 0.15, Math.sin(u.a) * u.r);
          const hot = id === current && u.i === planetHover;
          p.scale.setScalar(p.scale.x + ((hot ? 1.8 : 1) - p.scale.x) * k);
          const uni = p.material.uniforms;
          uni.uHot.value += ((hot ? 1 : 0) - uni.uHot.value) * k;
          uni.uTime.value = t;
        }
      }
    }
  };
}
