/* Medalhões FUI dos trabalhos: SVG gerado por código, camadas de anéis
   rotacionando + glifo central por projeto. Tudo vetorial, zero imagem. */

const NS = 'http://www.w3.org/2000/svg';
const STEEL = '#8A8F9C';
const BONE = '#EDE8DC';
const CRIMSON = '#E23B47';
const CYAN = '#45D8E8';

function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const px = (cx, r, a) => cx + Math.cos(a) * r;
const py = (cy, r, a) => cy + Math.sin(a) * r;

/* glifo central por projeto: {d} path · {c:[cx,cy,r]} círculo
   flags: a = crimson · b = ciano · fill = preenchido · o = opacidade */
const GLYPHS = {
  members: [
    { c: [100, 62, 7], a: 1, fill: 1 },
    { d: 'M70 98 L100 76 L130 98' },
    { d: 'M70 116 L100 94 L130 116', a: 1 },
    { d: 'M70 134 L100 112 L130 134' }
  ],
  access: [
    { d: 'M84 96 V82 a16 16 0 0 1 32 0 V96' },
    { d: 'M76 96 H124 V134 H76 Z' },
    { c: [100, 111, 6], a: 1 },
    { d: 'M100 117 V127', a: 1 }
  ],
  roulette: [
    { c: [100, 100, 40] },
    { c: [100, 100, 21] },
    { d: 'M140 100 H121 M100 140 V121 M60 100 H79 M100 60 V79' },
    { d: 'M128.3 128.3 L114.8 114.8 M71.7 128.3 L85.2 114.8 M71.7 71.7 L85.2 85.2 M128.3 71.7 L114.8 85.2' },
    { c: [117, 76, 5], a: 1, fill: 1 }
  ],
  lab: [
    { c: [100, 100, 34] },
    { d: 'M100 52 V70 M100 130 V148 M52 100 H70 M130 100 H148' },
    { c: [100, 100, 5], a: 1, fill: 1 },
    { c: [86, 88, 3.2], b: 1, fill: 1, o: 0.85 },
    { c: [116, 92, 3.2], b: 1, fill: 1, o: 0.6 },
    { c: [108, 116, 3.2], b: 1, fill: 1, o: 0.75 }
  ],
  chronos: [
    { c: [100, 100, 38] },
    { d: 'M100 54 V62 M100 138 V146 M54 100 H62 M138 100 H146 M132.5 67.5 L126.9 73.1 M67.5 67.5 L73.1 73.1 M67.5 132.5 L73.1 126.9 M132.5 132.5 L126.9 126.9' },
    { c: [100, 100, 14] },
    { d: 'M100 100 V74', a: 1 },
    { d: 'M100 100 L116 109', a: 1 }
  ],
  double: [
    { c: [86, 100, 26], a: 1, fill: 1, o: 0.14 },
    { c: [86, 100, 26], a: 1 },
    { c: [114, 100, 26] },
    { d: 'M100 78 V122', b: 1 }
  ]
};

const CODES = {
  members: 'SYS://MBR-01',
  access: 'SYS://ACL-02',
  roulette: 'SYS://SIM-03',
  lab: 'SYS://LAB-04',
  chronos: 'SYS://CRN-05',
  double: 'SYS://DBL-06'
};

export function initEmblems() {
  document.querySelectorAll('[data-emblem]').forEach((box, idx) => {
    const type = box.dataset.emblem;
    const svg = el('svg', { viewBox: '0 0 200 200', fill: 'none', 'aria-hidden': 'true' });

    /* anel externo de ticks (gira devagar) */
    const rotA = el('g', { class: 'em-rot' }, svg);
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 18 === 0;
      const r1 = long ? 87 : 91;
      el('line', {
        x1: px(100, r1, a), y1: py(100, r1, a),
        x2: px(100, 95, a), y2: py(100, 95, a),
        stroke: long ? CRIMSON : STEEL,
        'stroke-width': long ? 2 : 1,
        opacity: long ? 0.85 : 0.35
      }, rotA);
    }

    /* arcos segmentados (contra-rotação) */
    const rotB = el('g', { class: 'em-rot-rev' }, svg);
    el('circle', { cx: 100, cy: 100, r: 82, stroke: STEEL, 'stroke-width': 1, opacity: 0.25, pathLength: 100, 'stroke-dasharray': '14 4 8 6 20 4 30 14' }, rotB);
    el('circle', { cx: 100, cy: 100, r: 78, stroke: CRIMSON, 'stroke-width': 2.5, opacity: 0.75, pathLength: 100, 'stroke-dasharray': '16 84', 'stroke-dashoffset': String(-(idx * 13) % 100) }, rotB);
    el('circle', { cx: 100, cy: 100, r: 74, stroke: CYAN, 'stroke-width': 1, opacity: 0.5, pathLength: 100, 'stroke-dasharray': '6 10 2 82', 'stroke-dashoffset': String(-(idx * 29) % 100) }, rotB);

    /* octógono tracejado */
    const oct = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      return px(100, 64, a).toFixed(1) + ',' + py(100, 64, a).toFixed(1);
    }).join(' ');
    el('polygon', { points: oct, stroke: STEEL, 'stroke-width': 1, opacity: 0.3, 'stroke-dasharray': '5 7' }, svg);

    /* varredura de radar */
    const sw = el('g', { class: 'em-sweep', style: 'animation-delay:' + (-idx * 1.3) + 's' }, svg);
    el('line', { x1: 100, y1: 100, x2: 100, y2: 14, stroke: CYAN, 'stroke-width': 1.2, opacity: 0.35 }, sw);
    el('circle', { cx: 100, cy: 18, r: 2.6, fill: CYAN, opacity: 0.8 }, sw);

    /* anel interno + ticks finos */
    el('circle', { cx: 100, cy: 100, r: 52, stroke: STEEL, 'stroke-width': 1, opacity: 0.25 }, svg);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      el('line', {
        x1: px(100, 48, a), y1: py(100, 48, a),
        x2: px(100, 52, a), y2: py(100, 52, a),
        stroke: STEEL, 'stroke-width': 1, opacity: 0.3
      }, svg);
    }

    /* glifo central */
    const gly = el('g', { 'stroke-linecap': 'square' }, svg);
    (GLYPHS[type] || []).forEach((s) => {
      const color = s.b ? CYAN : s.a ? CRIMSON : BONE;
      if (s.c) {
        el('circle', {
          cx: s.c[0], cy: s.c[1], r: s.c[2],
          stroke: s.fill ? 'none' : color,
          fill: s.fill ? color : 'none',
          'stroke-width': 3, opacity: s.o ?? 1
        }, gly);
      } else {
        el('path', { d: s.d, stroke: color, 'stroke-width': 3, opacity: s.o ?? 1 }, gly);
      }
    });

    /* micro-labels mono */
    const t1 = el('text', { x: 8, y: 195, fill: STEEL, 'font-size': 7, opacity: 0.6, style: 'font-family:var(--mono);letter-spacing:.08em' }, svg);
    t1.textContent = CODES[type] || '';
    const t2 = el('text', { x: 158, y: 10, fill: STEEL, 'font-size': 7, opacity: 0.6, style: 'font-family:var(--mono);letter-spacing:.08em' }, svg);
    t2.textContent = 'v' + (idx + 2) + '.' + ((idx * 37) % 10) + '.' + ((idx * 53) % 10);

    box.appendChild(svg);
  });
}
