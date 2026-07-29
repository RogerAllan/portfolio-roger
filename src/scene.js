import * as THREE from 'three';

/* "Sinal no vazio" — a página é uma descida por um duto de dados.
   Cada seção tem uma formação temática posicionada na profundidade em que a
   câmera estará quando a seção centralizar — e os widgets do DOM conversam
   com o 3D via CustomEvents (fx:proc, fx:strategy, fx:defense, ...). */

/* identidade visual: obsidian + crimson (e seu tom profundo) + ciano HUD + neutros */
const VOID = 0x050507;
const CRIMSON = 0xe23b47;
const CRIMSON_DEEP = 0x8e1f28;
const HUD = 0x45d8e8;
const STEEL = 0xc9cdd6;
const LIVE = HUD; /* "ao vivo" agora é ciano, dentro da identidade */

const CHAPTERS = [
  { sel: '.hero',        accent: CRIMSON },
  { sel: '#trabalhos',   accent: CRIMSON },
  { sel: '#ecossistema', accent: CRIMSON },
  { sel: '#analise',     accent: HUD },
  { sel: '#ia',          accent: CRIMSON },
  { sel: '#seguranca',   accent: CRIMSON_DEEP },
  { sel: '#dados',       accent: HUD },
  { sel: '#frontend',    accent: CRIMSON },
  { sel: '#capacidades', accent: HUD },
  { sel: '#sobre',       accent: CRIMSON },
  { sel: '#contato',     accent: CRIMSON }
];

const SHARDS = [
  'SYS.OK', 'UPTIME 99.9%', '160+ CONTAINERS', '3 VPS', 'PM2 CLUSTER',
  'masterScoring()', 'delta-poll 5s', 'newest-first', 'Socket.IO',
  'React 19', 'FastAPI', 'PostgreSQL', 'Redis', 'Playwright', 'Celery',
  'JWT · refresh', 'HMAC webhook', 'bcrypt', 'httpOnly', 'RBAC',
  'Cloudflare Tunnel', 'Prometheus', 'Grafana', 'ON DELETE CASCADE',
  '0xE23B47', 'ws://ingest', 'tool_use', 'scraper 24/7', 'autoheal',
  'docker compose up -d', 'SELECT * FROM signals', 'TOP-3 · 12 · 35 · 3',
  /* personalidade: nerd, metaleiro, gamer */
  '\\m/ riff mode', 'GG WP', 'save point: git commit', 'respawn: pm2 restart',
  'boss fight: race condition', 'crit hit · 99.9%', 'NG+ em produção',
  'roll D20 → nat 20', 'no-hit run: deploy', 'drop tuning: C', '// TODO: dormir'
];

function glowTexture(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,.55)');
  grad.addColorStop(0.6, 'rgba(255,255,255,.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function shardTexture(text) {
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = '600 44px Consolas, monospace';
  const w = Math.ceil(probe.measureText(text).width);
  const c = document.createElement('canvas');
  c.width = w + 56; c.height = 96;
  const ctx = c.getContext('2d');
  ctx.font = '600 44px Consolas, monospace';
  ctx.fillStyle = 'rgba(201,205,214,.92)';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 28, 50);
  ctx.strokeStyle = 'rgba(201,205,214,.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(2, 22); ctx.lineTo(2, 2); ctx.lineTo(22, 2);
  ctx.moveTo(c.width - 2, c.height - 22); ctx.lineTo(c.width - 2, c.height - 2); ctx.lineTo(c.width - 22, c.height - 2);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.aspect = c.width / c.height;
  return tex;
}

function line(pts, color, opacity, loop) {
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return loop ? new THREE.LineLoop(geo, mat) : new THREE.Line(geo, mat);
}

function circlePts(r, n, z = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z));
  }
  return pts;
}

export function initScene() {
  let renderer;
  try {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg3d';
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return;
  }

  const mobile = innerWidth < 768;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  document.body.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(VOID, 0.05);
  const camera = new THREE.PerspectiveCamera(56, innerWidth / innerHeight, 0.1, 140);
  const glow = glowTexture();

  /* ---- caminho da câmera ---- */
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.0, 9),
    new THREE.Vector3(1.3, -3.5, 6.5),
    new THREE.Vector3(-1.5, -9, 4.5),
    new THREE.Vector3(1.1, -14.5, 2.5),
    new THREE.Vector3(-1.0, -20, 0.5),
    new THREE.Vector3(0.7, -25.5, -1.5),
    new THREE.Vector3(0, -31, -3.5)
  ]);

  /* ---- espinha de sinal ---- */
  const spinePts = path.getPoints(220).map((p) => new THREE.Vector3(p.x, p.y, p.z - 3.5));
  scene.add(line(spinePts, 0x2a2a36, 0.6, false));

  const nodeGeo = new THREE.OctahedronGeometry(0.11);
  const nodes = [];
  for (let i = 0; i < 10; i++) {
    const t = 0.04 + (i / 9) * 0.92;
    const m = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: CRIMSON, transparent: true, opacity: 0.85 }));
    const p = path.getPoint(t);
    m.position.set(p.x, p.y, p.z - 3.5);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glow, color: CRIMSON, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    halo.scale.setScalar(1.6);
    halo.position.copy(m.position);
    m.userData.halo = halo;
    scene.add(m, halo);
    nodes.push(m);
  }

  /* ---- estilhaços de dados ---- */
  const shards = [];
  const shardCount = mobile ? 16 : SHARDS.length;
  for (let i = 0; i < shardCount; i++) {
    const tex = shardTexture(SHARDS[i % SHARDS.length]);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.3, depthWrite: false, color: STEEL }));
    const t = (i + 0.5) / shardCount;
    const p = path.getPoint(Math.min(t + (Math.random() - 0.5) * 0.06, 1));
    const side = Math.random() < 0.5 ? -1 : 1;
    s.position.set(p.x + side * (3 + Math.random() * 4.5), p.y + (Math.random() - 0.5) * 3.2, p.z - 3 - Math.random() * 7);
    const h = 0.42 + Math.random() * 0.5;
    s.scale.set(h * tex.aspect, h, 1);
    s.userData = { baseY: s.position.y, phase: Math.random() * Math.PI * 2, baseOpacity: 0.16 + Math.random() * 0.26 };
    scene.add(s);
    shards.push(s);
  }

  /* ---- poeira em camadas ---- */
  function dust(count, size, opacity, spread) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const p = path.getPoint(Math.random());
      pos[i * 3] = p.x + (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = p.y + (Math.random() - 0.5) * spread * 0.6;
      pos[i * 3 + 2] = p.z - 4 + (Math.random() - 0.5) * spread;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size, map: glow, transparent: true, opacity, color: 0x8a8f9c,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    scene.add(pts);
    return pts;
  }
  const dustFar = dust(mobile ? 200 : 560, 0.10, 0.35, 26);
  const dustMid = dust(mobile ? 120 : 340, 0.16, 0.28, 16);
  const dustNear = dust(mobile ? 50 : 140, 0.30, 0.16, 10);

  /* ---- nebulosas ---- */
  const nebulae = [];
  [[CRIMSON, 0.13, 0.15], [HUD, 0.09, 0.5], [0x8e1f28, 0.12, 0.85]].forEach(([color, opacity, t]) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glow, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    const p = path.getPoint(t);
    sp.position.set(p.x + (t < 0.5 ? -5 : 5), p.y - 2, p.z - 12);
    sp.scale.setScalar(26);
    scene.add(sp);
    nebulae.push(sp);
  });
  const chapterLight = nebulae[0];

  /* ============================================================
     FORMAÇÕES TEMÁTICAS — uma por seção, ligadas ao DOM por eventos
     ============================================================ */
  const formations = [];
  function register(chapter, offset, group, update) {
    group.visible = false;
    scene.add(group);
    formations.push({ chapter, offset, group, update });
  }

  /* -- TRABALHOS: molduras wireframe simbólicas (uma por card) -- */
  const featPlanes = [];
  {
    const g = new THREE.Group();
    const W = 1.15, H = 0.7;
    for (let i = 0; i < 6; i++) {
      const fr = new THREE.Group();
      const rect = line([
        new THREE.Vector3(-W, -H, 0), new THREE.Vector3(W, -H, 0),
        new THREE.Vector3(W, H, 0), new THREE.Vector3(-W, H, 0)
      ], STEEL, 0.2, true);
      const inner = line([
        new THREE.Vector3(-W * 0.72, -H * 0.6, 0), new THREE.Vector3(W * 0.72, -H * 0.6, 0),
        new THREE.Vector3(W * 0.72, H * 0.6, 0), new THREE.Vector3(-W * 0.72, H * 0.6, 0)
      ], CRIMSON, 0.12, true);
      const dot = new THREE.Mesh(new THREE.OctahedronGeometry(0.07),
        new THREE.MeshBasicMaterial({ color: CRIMSON, transparent: true, opacity: 0.3 }));
      fr.add(rect, inner, dot);
      fr.position.set((i % 2 ? 1.7 : -1.7) + Math.sin(i * 2.1) * 0.4, 1.2 - i * 0.75, -i * 1.2);
      fr.rotation.y = (i % 2 ? -1 : 1) * 0.35;
      fr.userData = { target: 0, hover: false, phase: i * 1.7, rect, inner, dot };
      g.add(fr);
      featPlanes.push(fr);
    }
    register(1, new THREE.Vector3(-3.8, 0, -5), g, (t, k) => {
      featPlanes.forEach((fr) => {
        const u = fr.userData;
        fr.position.y += Math.sin(t * 0.3 + u.phase) * 0.0012;
        u.target += ((u.hover ? 1 : 0.3) - u.target) * 0.06;
        u.rect.material.opacity = 0.55 * u.target * k;
        u.inner.material.opacity = 0.4 * u.target * k;
        u.dot.material.opacity = 0.7 * u.target * k;
        u.dot.rotation.y = t * 0.6;
      });
    });
    addEventListener('fx:feat', (e) => {
      const { i, on } = e.detail;
      if (featPlanes[i]) featPlanes[i].userData.hover = on;
    });
  }

  /* -- ECOSSISTEMA: núcleo + 6 satélites (1 por processo) -- */
  {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), new THREE.MeshBasicMaterial({ color: CRIMSON, transparent: true, opacity: 0.9 }));
    g.add(core);
    const sats = [], links = [];
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.09), new THREE.MeshBasicMaterial({ color: STEEL, transparent: true, opacity: 0.55 }));
      s.userData = { a: (i / 6) * Math.PI * 2, r: 1.5 + (i % 2) * 0.45, flash: 0, tilt: (i % 3 - 1) * 0.4 };
      const l = line([new THREE.Vector3(), new THREE.Vector3()], STEEL, 0.12, false);
      g.add(s, l);
      sats.push(s); links.push(l);
    }
    register(2, new THREE.Vector3(4.0, 0, -5.5), g, (t, k, accent) => {
      core.rotation.y = t * 0.5;
      core.material.color.copy(accent);
      core.material.opacity = 0.9 * k;
      sats.forEach((s, i) => {
        const a = s.userData.a + t * 0.22;
        s.position.set(Math.cos(a) * s.userData.r, Math.sin(a) * s.userData.r * 0.55 + s.userData.tilt, Math.sin(a) * 0.4);
        s.userData.flash *= 0.94;
        const f = s.userData.flash;
        s.scale.setScalar(1 + f * 1.8);
        s.material.color.lerpColors(new THREE.Color(STEEL), accent, f);
        s.material.opacity = (0.4 + f * 0.6) * k;
        const lp = links[i].geometry.attributes.position;
        lp.setXYZ(0, 0, 0, 0);
        lp.setXYZ(1, s.position.x, s.position.y, s.position.z);
        lp.needsUpdate = true;
        links[i].material.opacity = (0.08 + f * 0.5) * k;
      });
    });
    addEventListener('fx:proc', (e) => { if (sats[e.detail.i]) sats[e.detail.i].userData.flash = 1; });
  }

  /* -- ANÁLISE: 8 órbitas de estratégia convergindo num núcleo -- */
  {
    const g = new THREE.Group();
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: HUD, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    core.scale.setScalar(1.4);
    g.add(core);
    const orbits = [];
    for (let i = 0; i < 8; i++) {
      const o = line(circlePts(0.9 + i * 0.22, 64), i % 3 === 0 ? CRIMSON : HUD, 0.14, true);
      o.rotation.set(Math.random() * 0.9 - 0.45, Math.random() * 0.9 - 0.45, 0);
      o.userData = { boost: 0, speed: 0.06 + i * 0.012 };
      g.add(o);
      orbits.push(o);
    }
    register(3, new THREE.Vector3(-4.2, 0, -5.5), g, (t, k) => {
      core.material.opacity = (0.45 + Math.sin(t * 1.4) * 0.12) * k;
      orbits.forEach((o) => {
        o.rotation.z += o.userData.speed * 0.016;
        o.userData.boost *= 0.95;
        o.material.opacity = (0.1 + o.userData.boost * 0.65) * k;
      });
    });
    addEventListener('fx:strategy', (e) => {
      const o = orbits[e.detail.i];
      if (o) o.userData.boost = e.detail.on ? 1 : o.userData.boost;
      if (e.detail.on) core.scale.setScalar(1.75);
      else core.scale.setScalar(1.4);
    });
  }

  /* -- IA: constelação neural com sinapses que disparam -- */
  {
    const g = new THREE.Group();
    const N = 14;
    const npos = [];
    for (let i = 0; i < N; i++) {
      npos.push(new THREE.Vector3((Math.random() - 0.5) * 4.4, (Math.random() - 0.5) * 2.8, (Math.random() - 0.5) * 2.2));
    }
    const edges = [];
    for (let i = 0; i < N; i++) {
      const dists = npos.map((p, j) => ({ j, d: i === j ? 1e9 : p.distanceTo(npos[i]) })).sort((a, b) => a.d - b.d);
      edges.push([i, dists[0].j], [i, dists[1].j]);
    }
    const epts = [];
    edges.forEach(([a, b]) => { epts.push(npos[a], npos[b]); });
    const eGeo = new THREE.BufferGeometry().setFromPoints(epts);
    const eMat = new THREE.LineBasicMaterial({ color: STEEL, transparent: true, opacity: 0.1 });
    g.add(new THREE.LineSegments(eGeo, eMat));
    const dotGeo = new THREE.BufferGeometry().setFromPoints(npos);
    const dotMat = new THREE.PointsMaterial({ size: 0.14, map: glow, color: CRIMSON, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
    g.add(new THREE.Points(dotGeo, dotMat));
    const pulses = [];
    for (let i = 0; i < 5; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: HUD, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.scale.setScalar(0.34);
      sp.userData = { t: 2, a: null, b: null };
      g.add(sp);
      pulses.push(sp);
    }
    register(4, new THREE.Vector3(4.2, 0, -5.5), g, (t, k, accent, dt) => {
      g.rotation.y = Math.sin(t * 0.1) * 0.25;
      eMat.opacity = 0.1 * k;
      dotMat.opacity = 0.55 * k;
      pulses.forEach((sp) => {
        if (sp.userData.t < 1) {
          sp.userData.t += dt * 1.6;
          const u = Math.min(sp.userData.t, 1);
          sp.position.lerpVectors(sp.userData.a, sp.userData.b, u);
          sp.material.opacity = Math.sin(u * Math.PI) * 0.9 * k;
        } else sp.material.opacity = 0;
      });
    });
    addEventListener('fx:iacap', () => {
      const sp = pulses.find((p) => p.userData.t >= 1);
      if (!sp) return;
      const [a, b] = edges[Math.floor(Math.random() * edges.length)];
      sp.userData.a = npos[a]; sp.userData.b = npos[b]; sp.userData.t = 0;
    });
  }

  /* -- SEGURANÇA: 3 anéis hexagonais (os anéis de defesa) -- */
  {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshBasicMaterial({ color: 0x8e1f28, transparent: true, opacity: 0.9 }));
    g.add(core);
    const shells = [];
    [1.0, 1.65, 2.3].forEach((r, i) => {
      const h = line(circlePts(r, 6), i === 0 ? CRIMSON : 0x8e1f28, 0.4 - i * 0.08, true);
      h.userData = { boost: 0, dir: i % 2 ? -1 : 1, base: 0.34 - i * 0.07 };
      g.add(h);
      shells.push(h);
    });
    register(5, new THREE.Vector3(0, 0.4, -7.5), g, (t, k) => {
      core.rotation.y = t * 0.4;
      core.material.opacity = 0.85 * k;
      shells.forEach((h, i) => {
        h.rotation.z += h.userData.dir * 0.0022;
        h.userData.boost *= 0.95;
        const b = h.userData.boost;
        h.scale.setScalar(1 + b * 0.12);
        h.material.opacity = (h.userData.base + b * 0.55) * k;
      });
    });
    addEventListener('fx:defense', (e) => { if (shells[e.detail.i]) shells[e.detail.i].userData.boost = 1; });
  }

  /* -- DADOS: grafo de schema (nós + FKs) -- */
  {
    const g = new THREE.Group();
    const L = [-1.7, 0, 1.7].map((y) => new THREE.Vector3(-1.4, y * 0.8, 0));
    const R = [-1.2, 0.4, 1.6].map((y) => new THREE.Vector3(1.4, y * 0.8, -0.3));
    const all = [...L, ...R];
    const sq = circlePts(0.26, 4);
    all.forEach((p) => {
      const n = line(sq, STEEL, 0.4, true);
      n.position.copy(p);
      n.rotation.z = Math.PI / 4;
      g.add(n);
    });
    const fk = [[0, 3], [1, 3], [1, 4], [2, 5], [0, 5]];
    const fkLines = fk.map(([a, b]) => {
      const l = line([all[a], all[b]], HUD, 0.14, false);
      l.userData = { boost: 0 };
      g.add(l);
      return l;
    });
    register(6, new THREE.Vector3(-4.0, 0, -6), g, (t, k) => {
      g.rotation.y = Math.sin(t * 0.12) * 0.3;
      fkLines.forEach((l) => {
        l.userData.boost *= 0.94;
        l.material.opacity = (0.1 + l.userData.boost * 0.6) * k;
      });
      g.children.forEach((c) => { if (c.type === 'LineLoop') c.material.opacity = 0.34 * k; });
    });
    addEventListener('fx:data', () => { fkLines.forEach((l) => { l.userData.boost = 1; }); });
  }

  /* -- FRONTEND: skill tree que acende por habilidade -- */
  {
    const g = new THREE.Group();
    /* raiz embaixo, 2 galhos, 8 folhas (uma por skill do ledger) */
    const root = new THREE.Vector3(0, -1.6, 0);
    const forks = [new THREE.Vector3(-1.1, -0.4, 0), new THREE.Vector3(1.1, -0.4, 0)];
    const leaves = [];
    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? 0 : 1;
      const j = i % 4;
      leaves.push(new THREE.Vector3(forks[side].x + (j - 1.5) * 0.85, 0.9 + (j % 2) * 0.7, (j - 1.5) * 0.2));
    }
    g.add(line([root, forks[0]], STEEL, 0.25, false));
    g.add(line([root, forks[1]], STEEL, 0.25, false));
    const branches = leaves.map((p, i) => {
      const l = line([forks[i < 4 ? 0 : 1], p], STEEL, 0.14, false);
      l.userData = { boost: 0 };
      g.add(l);
      return l;
    });
    const rootMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshBasicMaterial({ color: CRIMSON, transparent: true, opacity: 0.9 }));
    rootMesh.position.copy(root);
    g.add(rootMesh);
    const leafMeshes = leaves.map((p, i) => {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.09), new THREE.MeshBasicMaterial({ color: STEEL, transparent: true, opacity: 0.5 }));
      m.position.copy(p);
      m.userData = { boost: 0, phase: i * 0.8 };
      g.add(m);
      return m;
    });
    register(7, new THREE.Vector3(4.0, 0, -5.5), g, (t, k, accent) => {
      g.rotation.y = Math.sin(t * 0.1) * 0.22;
      rootMesh.rotation.y = t * 0.5;
      rootMesh.material.opacity = 0.85 * k;
      leafMeshes.forEach((m, i) => {
        m.userData.boost *= 0.95;
        const b = m.userData.boost;
        m.position.y = leaves[i].y + Math.sin(t * 0.5 + m.userData.phase) * 0.06;
        m.scale.setScalar(1 + b * 1.2);
        m.rotation.y = t * 0.4;
        m.material.color.lerpColors(new THREE.Color(STEEL), new THREE.Color(CRIMSON), b);
        m.material.opacity = (0.4 + b * 0.55) * k;
        branches[i].userData.boost = Math.max(branches[i].userData.boost * 0.95, b * 0.9);
        branches[i].material.opacity = (0.1 + branches[i].userData.boost * 0.5) * k;
      });
    });
    addEventListener('fx:front', (e) => {
      const m = leafMeshes[e.detail.i];
      if (m && e.detail.on) m.userData.boost = 1;
    });
  }

  /* -- PIPELINE: conduíte de energia com estações vivas -- */
  {
    const g = new THREE.Group();
    const stPts = [
      new THREE.Vector3(-3.2, -0.25, 0),
      new THREE.Vector3(-1.6, 0.22, 0.25),
      new THREE.Vector3(0, 0.42, 0),
      new THREE.Vector3(1.6, 0.22, -0.25),
      new THREE.Vector3(3.2, -0.25, 0)
    ];
    const curve = new THREE.CatmullRomCurve3(stPts);
    const fade = []; /* [material, opacidade base] */

    /* trilho duplo + travessas */
    const railPts = curve.getPoints(90);
    [-0.09, 0.09].forEach((off) => {
      const l = line(railPts.map((p) => new THREE.Vector3(p.x, p.y + off, p.z)), STEEL, 0.3, false);
      fade.push([l.material, 0.3]);
      g.add(l);
    });
    for (let i = 0; i <= 22; i++) {
      const p = curve.getPoint(i / 22);
      const l = line([new THREE.Vector3(p.x, p.y - 0.09, p.z), new THREE.Vector3(p.x, p.y + 0.09, p.z)], STEEL, 0.16, false);
      fade.push([l.material, 0.16]);
      g.add(l);
    }

    /* estações, cada uma com estrutura própria */
    const stations = stPts.map((p, i) => {
      const st = new THREE.Group();
      st.position.copy(p);
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.15), new THREE.MeshBasicMaterial({ color: STEEL, transparent: true, opacity: 0.6 }));
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: HUD, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.scale.setScalar(1.2);
      st.add(core, halo);
      const u = { core, halo, flash: 0, spin: [] };
      if (i === 0) { /* coleta: funil captando */
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.46, 4, 1, true),
          new THREE.MeshBasicMaterial({ color: CRIMSON, wireframe: true, transparent: true, opacity: 0.4 }));
        cone.position.y = 0.52;
        cone.rotation.x = Math.PI;
        st.add(cone);
        u.spin.push([cone, 0.5, 'y']);
        fade.push([cone.material, 0.4]);
      } else if (i === 1) { /* tempo real: anel veloz */
        const r = line(circlePts(0.34, 40), HUD, 0.5, true);
        st.add(r);
        u.spin.push([r, 2.4, 'z']);
        fade.push([r.material, 0.5]);
      } else if (i === 2) { /* análise: núcleo de fusão */
        [0.3, 0.44].forEach((rad, j) => {
          const o = line(circlePts(rad, 44), j ? CRIMSON : HUD, 0.45, true);
          o.rotation.x = 0.9 * (j ? -1 : 1);
          o.rotation.y = 0.5;
          st.add(o);
          u.spin.push([o, 1 + j * 0.6, 'z']);
          fade.push([o.material, 0.45]);
        });
      } else if (i === 3) { /* operação: casco hexagonal */
        const h = line(circlePts(0.38, 6), CRIMSON, 0.5, true);
        st.add(h);
        u.spin.push([h, 0.5, 'z']);
        fade.push([h.material, 0.5]);
      } else { /* exposição: ondas irradiando */
        u.ripples = [0, 1, 2].map((j) => {
          const rp = line(circlePts(0.2, 40), HUD, 0, true);
          rp.userData.ph = j / 3;
          st.add(rp);
          return rp;
        });
      }
      st.userData = u;
      g.add(st);
      return st;
    });

    /* três pulsos com rastro */
    const pulses = [0, 0.34, 0.67].map((off, pi) => {
      const mk = (scale, op) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: pi ? HUD : CRIMSON, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
        s.scale.setScalar(scale);
        g.add(s);
        return s;
      };
      return { head: mk(pi ? 0.4 : 0.55, 0.9), t1: mk(0.28, 0.4), t2: mk(0.2, 0.18), u: off, target: null, boost: 0 };
    });

    /* corrente de partículas fluindo pelo conduíte */
    const SN = mobile ? 50 : 120;
    const sPos = new Float32Array(SN * 3);
    const sT = new Float32Array(SN);
    const sOff = new Float32Array(SN * 2);
    for (let i = 0; i < SN; i++) {
      sT[i] = Math.random();
      sOff[i * 2] = (Math.random() - 0.5) * 0.22;
      sOff[i * 2 + 1] = (Math.random() - 0.5) * 0.22;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    const sMat = new THREE.PointsMaterial({ size: 0.05, map: glow, color: HUD, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    g.add(new THREE.Points(sGeo, sMat));

    const tmpV = new THREE.Vector3();
    register(8, new THREE.Vector3(0, -0.5, -6), g, (t, k, accent, dt) => {
      fade.forEach(([m, b]) => { m.opacity = b * k; });
      sMat.opacity = 0.45 * k;
      for (let i = 0; i < SN; i++) {
        sT[i] += dt * (0.05 + (i % 7) * 0.008);
        curve.getPoint(sT[i] % 1, tmpV);
        sPos[i * 3] = tmpV.x + sOff[i * 2];
        sPos[i * 3 + 1] = tmpV.y + sOff[i * 2 + 1];
        sPos[i * 3 + 2] = tmpV.z;
      }
      sGeo.attributes.position.needsUpdate = true;

      pulses.forEach((p) => {
        if (p.target !== null) {
          const d = p.target - p.u;
          p.u += d * 0.12;
          if (Math.abs(d) < 0.01) p.target = null;
        } else {
          p.u = (p.u + dt * (0.1 + p.boost)) % 1;
        }
        p.boost *= 0.96;
        curve.getPoint(p.u, tmpV);
        p.head.position.copy(tmpV);
        p.head.material.opacity = 0.85 * k;
        curve.getPoint(Math.max(p.u - 0.035, 0), tmpV);
        p.t1.position.copy(tmpV);
        p.t1.material.opacity = 0.35 * k;
        curve.getPoint(Math.max(p.u - 0.07, 0), tmpV);
        p.t2.position.copy(tmpV);
        p.t2.material.opacity = 0.15 * k;
      });

      stations.forEach((st) => {
        const u = st.userData;
        let near = 0;
        pulses.forEach((p) => {
          near = Math.max(near, Math.exp(-Math.pow(st.position.distanceTo(p.head.position) * 3.2, 2)));
        });
        u.flash = Math.max(u.flash * 0.94, near);
        u.core.rotation.y = t * 0.7;
        u.core.scale.setScalar(1 + u.flash * 0.8);
        u.core.material.color.lerpColors(new THREE.Color(STEEL), accent, u.flash);
        u.core.material.opacity = (0.45 + u.flash * 0.5) * k;
        u.halo.material.color.copy(accent);
        u.halo.material.opacity = u.flash * 0.65 * k;
        u.halo.scale.setScalar(1 + u.flash * 1.4);
        u.spin.forEach(([o, s, ax]) => { o.rotation[ax] += s * dt; });
        if (u.ripples) {
          u.ripples.forEach((rp) => {
            const ph = ((t * 0.35) + rp.userData.ph) % 1;
            rp.scale.setScalar(0.4 + ph * 2.6);
            rp.material.opacity = Math.max(0, 0.55 * (1 - ph)) * k;
          });
        }
      });
    });
    addEventListener('fx:stage', (e) => {
      pulses[0].target = 0.02 + (e.detail.i / 4) * 0.96;
      pulses.forEach((p) => { p.boost = 0.25; });
    });
  }

  /* -- CONTATO: espiral convergindo num sinal -- */
  {
    const g = new THREE.Group();
    const SP = 260;
    const spos = new Float32Array(SP * 3);
    for (let i = 0; i < SP; i++) {
      const u = i / SP;
      const a = u * Math.PI * 9;
      const r = 0.15 + u * 3.2;
      spos[i * 3] = Math.cos(a) * r;
      spos[i * 3 + 1] = Math.sin(a) * r * 0.6;
      spos[i * 3 + 2] = -u * 1.4;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
    const sMat = new THREE.PointsMaterial({ size: 0.09, map: glow, color: LIVE, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
    g.add(new THREE.Points(sGeo, sMat));
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: LIVE, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    core.scale.setScalar(1.1);
    g.add(core);
    const ripple = line(circlePts(1, 48), LIVE, 0, true);
    ripple.userData = { t: 2 };
    g.add(ripple);
    register(10, new THREE.Vector3(0, 0.4, -6.5), g, (t, k, accent, dt) => {
      g.rotation.z = t * 0.1;
      sMat.opacity = 0.35 * k;
      core.material.opacity = (0.55 + Math.sin(t * 2.2) * 0.2) * k;
      core.scale.setScalar(1 + Math.sin(t * 2.2) * 0.12);
      if (ripple.userData.t < 1.6) {
        ripple.userData.t += dt;
        ripple.scale.setScalar(1 + ripple.userData.t * 2.2);
        ripple.material.opacity = Math.max(0, 0.7 - ripple.userData.t * 0.45) * k;
      } else ripple.material.opacity = 0;
    });
    addEventListener('fx:contact', () => { ripple.userData.t = 0; ripple.scale.setScalar(1); });
  }

  /* ---- capítulos: limites e posicionamento das formações ---- */
  let bounds = [];
  function measure() {
    const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    bounds = CHAPTERS.map((c) => {
      const el = document.querySelector(c.sel);
      return el ? el.offsetTop : 0;
    });
    formations.forEach((f) => {
      const el = document.querySelector(CHAPTERS[f.chapter].sel);
      if (!el) return;
      const tC = Math.min(Math.max((el.offsetTop + el.offsetHeight * 0.5 - innerHeight * 0.5) / max, 0), 1);
      const p = path.getPoint(tC);
      f.group.position.set(p.x + f.offset.x, p.y + f.offset.y, p.z + f.offset.z);
    });
  }
  measure();
  addEventListener('load', measure);
  addEventListener('resize', () => {
    measure();
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const accent = new THREE.Color(CHAPTERS[0].accent);
  const accentTarget = new THREE.Color(CHAPTERS[0].accent);

  let mx = 0, my = 0, px = 0, py = 0;
  addEventListener('pointermove', (e) => {
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  const clock = new THREE.Clock();
  const camPos = new THREE.Vector3(), lookPos = new THREE.Vector3();
  let lastT = 0, lastCh = -1, kick = 0, flash = 0, emitAcc = 0;

  function frame() {
    const t = clock.getElapsedTime();
    const dt = Math.min(t - lastT, 0.05);
    lastT = t;
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = window.scrollY || 0;
    const p = max > 0 ? Math.min(y / max, 1) : 0;

    const center = y + innerHeight * 0.5;
    let ch = 0;
    for (let i = 0; i < bounds.length; i++) if (center >= bounds[i]) ch = i;
    accentTarget.setHex(CHAPTERS[ch].accent);
    accent.lerp(accentTarget, 0.025);
    chapterLight.material.color.copy(accent);

    /* troca de capítulo: punch de FOV + flash de luz ("chug") */
    if (ch !== lastCh) {
      lastCh = ch;
      kick = 1;
      flash = 0.3;
      window.dispatchEvent(new CustomEvent('scene:chapter', { detail: { ch } }));
    }
    kick *= 0.9;
    flash *= 0.94;
    camera.fov = 56 - kick * 4;
    camera.updateProjectionMatrix();

    /* estado compartilhado com a página (HUD + cor viva) */
    emitAcc += dt;
    if (emitAcc > 0.12) {
      emitAcc = 0;
      document.documentElement.style.setProperty('--accent', '#' + accent.getHexString());
      window.dispatchEvent(new CustomEvent('scene:state', { detail: { ch, depth: 2 - camPos.y, p } }));
    }

    px += (mx * 0.5 - px) * 0.035;
    py += (my * 0.28 - py) * 0.035;
    path.getPoint(p, camPos);
    path.getPoint(Math.min(p + 0.055, 1), lookPos);
    camera.position.set(camPos.x + px, camPos.y - py * 0.5, camPos.z);
    camera.lookAt(lookPos.x, lookPos.y, lookPos.z - 2.5);
    camera.rotation.z += px * -0.03;

    for (const n of nodes) {
      const d = Math.abs(n.position.y - camPos.y);
      const k = Math.exp(-d * d * 0.06);
      n.scale.setScalar(1 + k * 1.4);
      n.rotation.y = t * 0.6;
      n.material.color.copy(accent);
      n.material.opacity = 0.35 + k * 0.6;
      n.userData.halo.material.color.copy(accent);
      n.userData.halo.material.opacity = k * 0.5;
      n.userData.halo.scale.setScalar(1.2 + k * 1.6);
    }

    for (const s of shards) {
      s.position.y = s.userData.baseY + Math.sin(t * 0.25 + s.userData.phase) * 0.22;
      const d = Math.abs(s.position.y - camPos.y);
      const k = Math.exp(-d * d * 0.04);
      s.material.opacity = s.userData.baseOpacity * (0.5 + k * 1.1);
    }

    /* formações: só a vizinhança da câmera fica viva (e visível) */
    for (const f of formations) {
      const d = Math.abs(f.group.position.y - camPos.y);
      const k = Math.exp(-d * d * 0.05);
      f.group.visible = k > 0.02;
      if (f.group.visible) f.update(t, k, accent, dt);
    }

    dustFar.rotation.y = t * 0.004;
    dustMid.rotation.y = -t * 0.006;
    dustNear.position.y = Math.sin(t * 0.12) * 0.3;
    nebulae.forEach((n, i) => {
      n.material.opacity = n.material.opacity * 0.985 + (0.12 + Math.sin(t * 0.2 + i * 2.1) * 0.03) * 0.015;
    });
    chapterLight.material.opacity += flash * 0.3;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
