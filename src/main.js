import '@fontsource/chakra-petch/500.css';
import '@fontsource/chakra-petch/600.css';
import '@fontsource/chakra-petch/700.css';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/exo-2';
import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { I18N, LANGS } from './i18n.js';
import { initEmblems } from './emblems.js';
import { buildFlow, buildSecFlow } from './flows.js';

gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

initEmblems();

/* ============ IDIOMA ============ */
let lang = localStorage.getItem('lang');
if (!LANGS.includes(lang)) {
  const nav2 = (navigator.language || 'en').slice(0, 2);
  lang = LANGS.includes(nav2) ? nav2 : 'en';
}
const t = () => I18N[lang];

document.getElementById('yr').textContent = String(new Date().getFullYear());

/* ============ SCROLL SUAVE (Lenis + GSAP ticker) ============ */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.08, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ============ CENA 3D DE FUNDO (fase 2) ============ */
if (!reduce) {
  import('./scene.js').then((m) => m.initScene()).catch(() => { /* segue sem 3D */ });
}

/* ============ INTRO DO HERO (no load) ============ */
if (!reduce) {
  const intro = ['.hero .eyebrow', '.hero h1.name', '.hero .role-line', '.hero p.lead', '.hero .cta', '.hero .marquee'];
  gsap.set(intro, { autoAlpha: 0, y: 26 });
  gsap.to(intro, {
    autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
    stagger: 0.11, delay: 0.15, clearProps: 'transform'
  });
}

/* âncoras do menu compensando a nav sticky */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -72, duration: 1.1 });
    else target.scrollIntoView();
  });
});

/* ============ CONSOLE DE PROCESSOS ============ */
/* nomes e stacks são universais; cat/desc vêm do dicionário i18n */
const PROJECTS = [
  { nm: 'realtime-analytics', stack: ['React 19', 'Express', 'Socket.IO', 'Redis', 'PM2'] },
  { nm: 'ws-ingest + genai', stack: ['React', 'FastAPI', 'Google GenAI', 'WebSocket'] },
  { nm: 'scraper-pipeline', stack: ['FastAPI', 'Playwright', 'Prometheus', 'Grafana'] },
  { nm: 'dashboards-analíticos', stack: ['React 19', 'Express', 'Recharts'] },
  { nm: 'verité-shop', stack: ['React', 'FastAPI', 'PostgreSQL', 'InfinitePay'] },
  { nm: 'infra-observability', stack: ['Docker', 'Podman', 'Prometheus', 'PM2'] }
];

const procList = document.getElementById('procList');
const dossier = document.getElementById('dossier');
const dCat = document.getElementById('dCat');
const dName = document.getElementById('dName');
const dDesc = document.getElementById('dDesc');
const dStack = document.getElementById('dStack');

PROJECTS.forEach((p, i) => {
  const b = document.createElement('button');
  b.className = 'proc';
  b.setAttribute('role', 'tab');
  b.setAttribute('aria-current', i === 0 ? 'true' : 'false');
  b.innerHTML = '<span class="idx">' + String(i + 1).padStart(2, '0') + '</span>' +
    '<span><span class="pn">' + p.nm + '</span><span class="pc"></span></span>' +
    '<span class="st"><i></i>UP</span>';
  b.addEventListener('click', () => select(i, true));
  b.addEventListener('mouseenter', () => select(i, true));
  procList.appendChild(b);
});
function refreshProcCats() {
  Array.prototype.forEach.call(procList.children, (c, i) => {
    c.querySelector('.pc').textContent = t().projects[i].cat;
  });
  document.getElementById('procCount').textContent = t().procCount.replace('{n}', PROJECTS.length);
}

let current = -1, typeTimer = null;
function typeText(el, text) {
  clearInterval(typeTimer);
  if (reduce) { el.textContent = text; return; }
  el.innerHTML = '<span class="caret"></span>';
  let i = 0;
  typeTimer = setInterval(() => {
    i += 2;
    if (i >= text.length) { clearInterval(typeTimer); el.textContent = text; }
    else { el.innerHTML = text.slice(0, i) + '<span class="caret"></span>'; }
  }, 12);
}
function select(i, user) {
  if (i === current) return;
  current = i;
  if (user) stopAuto();
  const p = PROJECTS[i];
  const tr = t().projects[i];
  Array.prototype.forEach.call(procList.children, (c, j) => { c.setAttribute('aria-current', j === i ? 'true' : 'false'); });
  dCat.textContent = tr.cat;
  dName.textContent = p.nm;
  dName.dataset.text = p.nm;
  typeText(dDesc, tr.desc);
  dStack.classList.remove('on');
  dStack.innerHTML = p.stack.map((t) => '<span class="tag">' + t + '</span>').join('');
  const dFlow = document.getElementById('dFlow');
  dFlow.innerHTML = '';
  const flowSvg = buildFlow(i, !reduce);
  if (flowSvg) dFlow.appendChild(flowSvg);
  requestAnimationFrame(() => { requestAnimationFrame(() => { dStack.classList.add('on'); }); });
  dossier.classList.remove('scan');
  void dossier.offsetWidth;
  dossier.classList.add('scan');
  window.dispatchEvent(new CustomEvent('fx:proc', { detail: { i } }));
}
/* teclado ↑↓ quando o console está visível */
window.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  const r = document.getElementById('console').getBoundingClientRect();
  if (r.top > innerHeight || r.bottom < 0) return;
  e.preventDefault();
  stopAuto();
  select((current + (e.key === 'ArrowDown' ? 1 : PROJECTS.length - 1)) % PROJECTS.length, true);
});
/* auto-ciclo até o usuário tocar */
let auto = null;
function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
select(0, false);
if (!reduce) auto = setInterval(() => select((current + 1) % PROJECTS.length, false), 6000);

/* ============ LEDGER ↔ FEEDERS (análise) ============ */
const feeders = {};
document.querySelectorAll('.feeder[data-key]').forEach((f) => { feeders[f.dataset.key] = f; });
document.querySelectorAll('#stratLedger .lrow[data-key]').forEach((row) => {
  const lit = (on) => { const f = feeders[row.dataset.key]; if (f) f.classList.toggle('lit', on); };
  row.addEventListener('mouseenter', () => lit(true));
  row.addEventListener('mouseleave', () => lit(false));
  row.addEventListener('focus', () => lit(true));
  row.addEventListener('blur', () => lit(false));
});

/* ============ MATRIZ DE DEFESA ============ */
['p-auth', 'p-sess', 'p-surf'].forEach((id, i) => {
  const panel = document.getElementById(id);
  const holder = document.createElement('div');
  holder.className = 'def-flow';
  holder.setAttribute('aria-hidden', 'true');
  const svg = buildSecFlow(i, !reduce);
  if (svg) holder.appendChild(svg);
  panel.appendChild(holder);
});
const tabs = document.querySelectorAll('.def-tab');
tabs.forEach((t) => {
  t.addEventListener('click', () => {
    tabs.forEach((o) => o.setAttribute('aria-selected', o === t ? 'true' : 'false'));
    document.querySelectorAll('.def-panel').forEach((p) => {
      const on = p.id === t.dataset.panel;
      p.hidden = !on;
      p.classList.remove('on');
      if (on) { void p.offsetWidth; p.classList.add('on'); }
    });
  });
});

/* ============ PIPELINE ============ */
const stations = document.querySelectorAll('.station');
const pdK = document.getElementById('pdK'), pdT = document.getElementById('pdT'), pdD = document.getElementById('pdD');
let stage = 0;
function setStage(i) {
  stage = i;
  const st = t().stages[i];
  stations.forEach((s, j) => s.setAttribute('aria-selected', j === i ? 'true' : 'false'));
  pdK.textContent = st.k;
  pdT.textContent = st.t;
  pdD.textContent = st.d;
  window.dispatchEvent(new CustomEvent('fx:stage', { detail: { i } }));
}
stations.forEach((s) => {
  s.addEventListener('click', () => setStage(+s.dataset.i));
  s.addEventListener('mouseenter', () => setStage(+s.dataset.i));
});
setStage(0);

/* ============ CONTADORES + BARRAS ============ */
function runCount(el) {
  const to = parseFloat(el.dataset.to), suf = el.dataset.suffix || '', dur = 1200;
  let t0 = null;
  function step(ts) {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * e) + suf;
    if (p < 1) requestAnimationFrame(step); else el.textContent = to + suf;
  }
  requestAnimationFrame(step);
}
function fillBars(scope) {
  scope.querySelectorAll('.xp .fill[data-w]').forEach((f) => { f.style.width = f.dataset.w + '%'; });
}
function activate(el) {
  el.classList.add('in'); /* .score-card.in liga o gauge de 78% */
  el.querySelectorAll('.xr b[data-to]').forEach(runCount);
  fillBars(el);
}

/* ============ REVEALS (GSAP ScrollTrigger) ============ */
if (!reduce) {
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el,
      { autoAlpha: 0, y: 34 },
      {
        autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', overwrite: 'auto',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true, onEnter: () => activate(el) }
      });
  });

  /* ============ PARALLAX DISCRETO (scrub) ============ */
  gsap.to('.hero-glow', {
    y: 60, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.kanji-mark', {
    y: -50, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.utils.toArray('.feat-media').forEach((el) => {
    gsap.fromTo(el, { y: 18 }, {
      y: -18, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
} else {
  /* reduced-motion: tudo visível, valores finais direto */
  document.querySelectorAll('.reveal').forEach((n) => n.classList.add('in'));
  document.querySelectorAll('.xr b[data-to]').forEach((n) => { n.textContent = n.dataset.to + (n.dataset.suffix || ''); });
  fillBars(document);
}

/* ============ PONTE DOM → CENA 3D (fx:*) ============ */
const fx = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

document.querySelectorAll('#trabalhos .feat').forEach((el, i) => {
  el.addEventListener('mouseenter', () => fx('fx:feat', { i, on: true }));
  el.addEventListener('mouseleave', () => fx('fx:feat', { i, on: false }));
});
document.querySelectorAll('#stratLedger .lrow').forEach((el, i) => {
  el.addEventListener('mouseenter', () => fx('fx:strategy', { i, on: true }));
  el.addEventListener('mouseleave', () => fx('fx:strategy', { i, on: false }));
  el.addEventListener('focus', () => fx('fx:strategy', { i, on: true }));
  el.addEventListener('blur', () => fx('fx:strategy', { i, on: false }));
});
document.querySelectorAll('.ia-cap').forEach((el, i) => {
  el.addEventListener('mouseenter', () => fx('fx:iacap', { i }));
});
tabs.forEach((t, i) => {
  t.addEventListener('click', () => fx('fx:defense', { i }));
});
document.querySelectorAll('#dados .lrow').forEach((el) => {
  el.addEventListener('mouseenter', () => fx('fx:data', {}));
  el.addEventListener('focus', () => fx('fx:data', {}));
});
document.getElementById('contato').addEventListener('click', () => fx('fx:contact', {}));
document.querySelectorAll('#skillLedger .lrow').forEach((el, i) => {
  el.addEventListener('mouseenter', () => fx('fx:front', { i, on: true }));
  el.addEventListener('mouseleave', () => fx('fx:front', { i, on: false }));
  el.addEventListener('focus', () => fx('fx:front', { i, on: true }));
  el.addEventListener('blur', () => fx('fx:front', { i, on: false }));
});

/* ============ TOAST DE CONQUISTA (compartilhado) ============ */
const toastEl = document.getElementById('toast');
let toastTimer = null;
function achievement(html) {
  toastEl.innerHTML = html;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4200);
}

/* ============ HUD DE JOGO (alimentado pela cena 3D) ============ */
const gameHud = document.getElementById('gameHud');
const ghSector = document.getElementById('ghSector');
const ghDepth = document.getElementById('ghDepth');
const ghQuest = document.getElementById('ghQuest');
const questCells = I18N.pt.sectors.map(() => {
  const i = document.createElement('i');
  ghQuest.appendChild(i);
  return i;
});
const visited = new Set();
let mapCleared = false;
let lastChapter = -1;

const SCRAMBLE = '!<>-_\\/[]{}=+*^?#01';
function scramble(el, final) {
  let frame = 0;
  clearInterval(el._scr);
  el._scr = setInterval(() => {
    frame += 2;
    el.textContent = final.split('').map((c, j) =>
      j < frame ? c : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]).join('');
    if (frame >= final.length) { clearInterval(el._scr); el.textContent = final; }
  }, 26);
}

window.addEventListener('scene:state', (e) => {
  gameHud.classList.add('on');
  ghDepth.textContent = e.detail.depth.toFixed(1) + 'm';
});
window.addEventListener('scene:chapter', (e) => {
  const ch = e.detail.ch;
  lastChapter = ch;
  scramble(ghSector, String(ch + 1).padStart(2, '0') + ' · ' + t().sectors[ch]);
  visited.add(ch);
  questCells.forEach((c, j) => c.classList.toggle('done', visited.has(j)));
  if (!mapCleared && visited.size === t().sectors.length) {
    mapCleared = true;
    achievement(t().toastMap);
  }
});

/* ============ TILT DE CARTA (gamer) ============ */
if (!reduce && matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.feat-media .frame, .score-card, .ia-chat, .pipe-detail').forEach((el) => {
    el.style.transition = 'transform .3s ease-out';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(950px) rotateX(' + (-y * 3.2).toFixed(2) + 'deg) rotateY(' + (x * 3.2).toFixed(2) + 'deg)';
    });
    el.addEventListener('pointerleave', () => { el.style.transform = 'perspective(950px)'; });
  });
}

/* ============ KONAMI ============ */
(() => {
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let i = 0;
  window.addEventListener('keydown', (e) => {
    i = (e.key === seq[i]) ? i + 1 : (e.key === seq[0] ? 1 : 0);
    if (i === seq.length) {
      i = 0;
      achievement(t().toastKonami);
    }
  });
})();

/* ============ CITAÇÃO ROTATIVA (Linus com peso maior) ============ */
const QUOTES = [
  { en: 'Talk is cheap. Show me the code.',
    pt: 'Falar é fácil. Me mostra o código.',
    es: 'Hablar es fácil. Muéstrame el código.',
    by: 'Linus Torvalds', role: { pt: 'criador do Linux', en: 'creator of Linux', es: 'creador de Linux' } },
  { en: 'Simplicity is prerequisite for reliability.',
    pt: 'Simplicidade é pré-requisito de confiabilidade.',
    es: 'La simplicidad es prerrequisito de la confiabilidad.',
    by: 'Edsger W. Dijkstra', role: { pt: 'pioneiro da computação', en: 'computing pioneer', es: 'pionero de la computación' } },
  { en: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.',
    pt: 'Enxergamos só um pouco à frente, mas dá pra ver muito que precisa ser feito.',
    es: 'Solo vemos un poco hacia adelante, pero ahí se ve mucho por hacer.',
    by: 'Alan Turing', role: { pt: 'pai da computação', en: 'father of computing', es: 'padre de la computación' } },
  { en: 'Focus is a matter of deciding what things you\'re not going to do.',
    pt: 'Foco é decidir o que você não vai fazer.',
    es: 'Enfocarse es decidir qué cosas no vas a hacer.',
    by: 'John Carmack', role: { pt: 'criador de Doom e Quake', en: 'creator of Doom and Quake', es: 'creador de Doom y Quake' } },
  { en: 'When in doubt, use brute force.',
    pt: 'Na dúvida, força bruta.',
    es: 'En caso de duda, fuerza bruta.',
    by: 'Ken Thompson', role: { pt: 'criador do Unix', en: 'creator of Unix', es: 'creador de Unix' } },
  { en: 'The most damaging phrase in the language is: "We\'ve always done it this way."',
    pt: 'A frase mais perigosa que existe é: "sempre fizemos assim".',
    es: 'La frase más dañina que existe es: "siempre lo hicimos así".',
    by: 'Grace Hopper', role: { pt: 'pioneira da programação', en: 'programming pioneer', es: 'pionera de la programación' } }
];
/* pool com Linus em dobro: ele abre a maioria das visitas sem virar fixo */
const quotePool = [0, 0, 1, 2, 3, 4, 5];
const quoteIdx = quotePool[Math.floor(Math.random() * quotePool.length)];
function renderQuote() {
  const q = QUOTES[quoteIdx];
  document.getElementById('tqText').textContent = '' + q.en + '';
  document.getElementById('tqTr').textContent = lang === 'en' ? '' : q[lang];
  document.getElementById('tqBy').innerHTML = '<b>' + q.by + '</b> · ' + q.role[lang];
}

/* ============ APLICAÇÃO DE IDIOMA ============ */
function applyLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  document.documentElement.lang = l === 'pt' ? 'pt-BR' : l;
  const dict = t().ui;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('.lang button').forEach((b) =>
    b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false'));
  /* whatsapp com mensagem pronta no idioma atual */
  const wa = document.getElementById('waLink');
  if (wa && dict['contact.waMsg']) {
    wa.href = 'https://wa.me/5547988731921?text=' + encodeURIComponent(dict['contact.waMsg']);
  }
  /* glitch nos títulos de seção, recalculado por idioma */
  document.querySelectorAll('.sec-head h2, #contato h2').forEach((h) => {
    h.classList.add('glitch-blk');
    h.dataset.text = h.textContent.trim();
  });
  refreshProcCats();
  renderQuote();
  const cur = current;
  current = -1;
  select(cur < 0 ? 0 : cur, false);
  setStage(stage);
  if (lastChapter >= 0) {
    ghSector.textContent = String(lastChapter + 1).padStart(2, '0') + ' · ' + t().sectors[lastChapter];
  }
  /* alturas mudam com o texto → cena re-mede os capítulos */
  window.dispatchEvent(new Event('resize'));
}
document.querySelectorAll('.lang button').forEach((b) =>
  b.addEventListener('click', () => applyLang(b.dataset.lang)));
applyLang(lang);
