/* Fluxogramas dos processos do console: SVG gerado por código, um por projeto.
   Nós = arquitetura real; pulso ciano viaja pela cadeia principal (SMIL). */

const NS = 'http://www.w3.org/2000/svg';
const STEEL = '#8A8F9C';
const DIM = '#5B5F6B';
const CRIMSON = '#E23B47';
const CYAN = '#45D8E8';
const BG = '#0B0B10';

function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

/* nodes: {x, y, l(abel), a(ccent)?} · chain: índice dos nós do caminho do pulso
   extra: arestas fora da cadeia · note: legenda pequena {x, y, t} */
export const FLOWS = [
  { /* realtime-analytics */
    nodes: [
      { x: 24, y: 42, l: 'FEED' }, { x: 88, y: 42, l: 'INGEST' },
      { x: 162, y: 42, l: 'SCORE', a: 1 }, { x: 236, y: 42, l: 'SOCKET' },
      { x: 300, y: 42, l: 'UI' },
      { x: 125, y: 14, l: 'REDIS' }, { x: 125, y: 70, l: 'PG' }
    ],
    chain: [0, 1, 2, 3, 4],
    extra: [[1, 5], [1, 6]],
    note: { x: 236, y: 66, t: 'PM2 ×4' }
  },
  { /* ws-ingest + genai */
    nodes: [
      { x: 22, y: 42, l: 'WS' }, { x: 88, y: 42, l: 'PROXY' },
      { x: 162, y: 42, l: 'ANALYZE' }, { x: 240, y: 42, l: 'GENAI', a: 1 },
      { x: 302, y: 42, l: 'UI' }
    ],
    chain: [0, 1, 2, 3, 4],
    extra: [],
    note: { x: 88, y: 66, t: 'reconnect ∞' }
  },
  { /* scraper-pipeline */
    nodes: [
      { x: 24, y: 42, l: 'SITE' }, { x: 90, y: 42, l: 'BOT', a: 1 },
      { x: 154, y: 42, l: 'API' }, { x: 218, y: 42, l: 'DB' },
      { x: 292, y: 42, l: 'GRAFANA' },
      { x: 255, y: 14, l: 'PROM' }
    ],
    chain: [0, 1, 2, 3, 4],
    extra: [[3, 5], [5, 4]],
    note: { x: 90, y: 66, t: '24/7 headless' }
  },
  { /* dashboards analíticos */
    nodes: [
      { x: 26, y: 42, l: 'DB' }, { x: 96, y: 42, l: 'API' },
      { x: 172, y: 42, l: 'CHARTS', a: 1 },
      { x: 268, y: 14, l: 'MARCA A' }, { x: 268, y: 42, l: 'MARCA B' }, { x: 268, y: 70, l: 'MARCA C' }
    ],
    chain: [0, 1, 2, 4],
    extra: [[2, 3], [2, 5]],
    note: { x: 96, y: 66, t: 'white-label' }
  },
  { /* verité-shop */
    nodes: [
      { x: 26, y: 42, l: 'LOJA' }, { x: 94, y: 42, l: 'CART' },
      { x: 168, y: 42, l: 'PAY', a: 1 }, { x: 240, y: 42, l: 'PEDIDO' },
      { x: 302, y: 42, l: '✓' }
    ],
    chain: [0, 1, 2, 3, 4],
    extra: [],
    note: { x: 168, y: 66, t: 'InfinitePay' }
  },
  { /* infra-observability */
    nodes: [
      { x: 24, y: 42, l: 'EDGE' }, { x: 94, y: 42, l: 'TUNNEL' },
      { x: 170, y: 42, l: 'APPS', a: 1 },
      { x: 258, y: 14, l: 'PG' }, { x: 258, y: 42, l: 'REDIS' }, { x: 258, y: 70, l: 'MQ' }
    ],
    chain: [0, 1, 2, 4],
    extra: [[2, 3], [2, 5]],
    note: { x: 170, y: 66, t: '160+ containers' }
  }
];

/* fluxos da matriz de defesa: um por aba; deny = caminho de ataque bloqueado */
export const SEC_FLOWS = [
  { /* autenticação */
    nodes: [
      { x: 24, y: 42, l: 'LOGIN' }, { x: 92, y: 42, l: 'BCRYPT' },
      { x: 160, y: 42, l: '2FA', a: 1 }, { x: 226, y: 42, l: 'JWT' },
      { x: 294, y: 42, l: 'SESSÃO' }
    ],
    chain: [0, 1, 2, 3, 4],
    extra: [],
    note: { x: 160, y: 66, t: 'timing-safe' }
  },
  { /* sessão & acesso */
    nodes: [
      { x: 24, y: 42, l: 'CLIENT' }, { x: 94, y: 42, l: 'COOKIE' },
      { x: 160, y: 42, l: 'RATE' }, { x: 226, y: 42, l: 'RBAC', a: 1 },
      { x: 294, y: 42, l: 'ROTA' },
      { x: 34, y: 14, l: 'BRUTE', d: 1 }
    ],
    chain: [0, 1, 2, 3, 4],
    extra: [],
    deny: { chain: [5, 2] },
    note: { x: 94, y: 66, t: 'httpOnly' }
  },
  { /* superfície & dados */
    nodes: [
      { x: 22, y: 42, l: 'WEB' }, { x: 90, y: 42, l: 'TUNNEL', a: 1 },
      { x: 158, y: 42, l: 'HELMET' }, { x: 226, y: 42, l: 'APP' },
      { x: 294, y: 42, l: 'DB' },
      { x: 92, y: 14, l: 'WEBHOOK' }, { x: 170, y: 14, l: 'HMAC ✓' }
    ],
    chain: [0, 1, 2, 3, 4],
    extra: [[5, 6], [6, 3]],
    note: { x: 90, y: 66, t: 'zero portas abertas' }
  }
];

let uid = 0;

export function buildFlow(i, animate) {
  return render(FLOWS[i], animate, i);
}
export function buildSecFlow(i, animate) {
  return render(SEC_FLOWS[i], animate, i + 2);
}

function render(spec, animate, seed) {
  if (!spec) return null;
  const svg = el('svg', { viewBox: '0 0 320 84', fill: 'none', 'aria-hidden': 'true' });
  const N = (n) => spec.nodes[n];

  /* arestas */
  const edges = [];
  for (let k = 0; k < spec.chain.length - 1; k++) edges.push([spec.chain[k], spec.chain[k + 1]]);
  edges.push(...spec.extra);
  edges.forEach(([a, b]) => {
    el('line', {
      x1: N(a).x, y1: N(a).y, x2: N(b).x, y2: N(b).y,
      stroke: STEEL, 'stroke-width': 1, opacity: 0.3
    }, svg);
  });

  /* caminho do pulso (invisível) */
  const d = 'M ' + spec.chain.map((n) => N(n).x + ' ' + N(n).y).join(' L ');
  const pid = 'flowp' + (uid++);
  el('path', { id: pid, d, stroke: 'none', fill: 'none' }, svg);

  /* caminho de ataque bloqueado (tracejado crimson, morre no alvo) */
  if (spec.deny) {
    const dc = spec.deny.chain;
    for (let k = 0; k < dc.length - 1; k++) {
      el('line', {
        x1: N(dc[k]).x, y1: N(dc[k]).y, x2: N(dc[k + 1]).x, y2: N(dc[k + 1]).y,
        stroke: CRIMSON, 'stroke-width': 1, opacity: 0.3, 'stroke-dasharray': '4 4'
      }, svg);
    }
    const last = N(dc[dc.length - 1]);
    const x = el('text', {
      x: last.x + 16, y: last.y - 10, fill: CRIMSON, 'font-size': 11,
      'text-anchor': 'middle', opacity: 0.85, style: 'font-family:var(--mono);font-weight:700'
    }, svg);
    x.textContent = '✕';
    if (animate) {
      const dd = 'M ' + dc.map((n) => N(n).x + ' ' + N(n).y).join(' L ');
      const dpid = 'flowd' + (uid++);
      el('path', { id: dpid, d: dd, stroke: 'none', fill: 'none' }, svg);
      const dot = el('g', {}, svg);
      el('circle', { r: 2.4, fill: CRIMSON }, dot);
      const am = el('animateMotion', { dur: '3.6s', repeatCount: 'indefinite' }, dot);
      el('mpath', {}, am).setAttribute('href', '#' + dpid);
      const fadeAn = el('animate', {
        attributeName: 'opacity', values: '0;1;1;0', keyTimes: '0;.2;.82;1',
        dur: '3.6s', repeatCount: 'indefinite'
      }, dot);
      void fadeAn;
    }
  }

  /* nós */
  spec.nodes.forEach((n) => {
    const w = n.l.length * 5.6 + 12;
    el('rect', {
      x: n.x - w / 2, y: n.y - 9, width: w, height: 18,
      fill: BG, stroke: n.d ? CRIMSON : n.a ? CRIMSON : STEEL,
      'stroke-width': n.a ? 1.6 : 1, opacity: n.d ? 0.7 : n.a ? 0.95 : 0.55,
      'stroke-dasharray': n.d ? '3 3' : 'none'
    }, svg);
    const t = el('text', {
      x: n.x, y: n.y + 2.8, fill: n.d ? CRIMSON : n.a ? '#EDE8DC' : STEEL,
      'font-size': 8, 'text-anchor': 'middle',
      style: 'font-family:var(--mono);letter-spacing:.06em'
    }, svg);
    t.textContent = n.l;
  });

  /* legenda */
  if (spec.note) {
    const t = el('text', {
      x: spec.note.x, y: spec.note.y + 14, fill: DIM, 'font-size': 6.6,
      'text-anchor': 'middle', style: 'font-family:var(--mono);letter-spacing:.08em'
    }, svg);
    t.textContent = spec.note.t;
  }

  /* pulso viajante */
  if (animate) {
    const dot = el('g', {}, svg);
    el('circle', { r: 2.6, fill: CYAN, opacity: 0.9 }, dot);
    el('circle', { r: 5.5, fill: 'none', stroke: CYAN, 'stroke-width': 0.8, opacity: 0.35 }, dot);
    const am = el('animateMotion', { dur: (2.8 + seed * 0.25) + 's', repeatCount: 'indefinite' }, dot);
    const mp = el('mpath', {}, am);
    mp.setAttribute('href', '#' + pid);
  }

  return svg;
}
