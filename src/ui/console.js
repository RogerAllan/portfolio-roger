/* Interação do centro de comando: a área escolhida (no radar ou nas abas) filtra
   os trabalhos e abre o painel de engenharia; a lista troca o que está na tela
   principal. A escolha sobrevive à troca de idioma. */
import { WORKS, worksFor } from '../content/index.js';
import { state, T, esc } from './state.js';
import { assetUrl } from '../fx/logo-frames.js';
import { setMiniArea } from './mini-galaxy.js';

let area = 'all';
let picked = WORKS[0].id;
let ac = null;
let spy = null;

const counted = (n, [one, many]) => `${n} ${n === 1 ? one : many}`;
/* luz do fundo em cada setor */
const SKY = { top: '#ffb547', trabalhos: '#3fd1c4', trajetoria: '#ffb547', resumo: '#7fd6ff', engenharia: '#b48cff', incidentes: '#e0242b', tema: '#b48cff', sobre: '#ffcf8a' };

function readout(el) {
  const t = T();
  if (area === 'all') { el.innerHTML = `<p class="cc-rhint">${esc(t.ui.radarHint)}</p><a class="cc-rgo" href="#sec-tema">${esc(t.ui.themeLink)}</a>`; return; }
  const tx = t.layers[area];
  const ins = state.manifest?.insignia?.[area];
  el.innerHTML = `${ins ? `<img src="${assetUrl(ins)}" alt="" width="52" height="52" />` : ''}
    <div class="cc-rtxt"><b>${esc(tx.name)}</b><span>${counted(worksFor(area).length, t.ui.workWord)}, ${counted(tx.techs.length, t.ui.techWord)}</span></div>
    <a class="cc-rgo" href="#sec-trabalhos">${esc(t.ui.seeArea)}</a>`;
}

function apply(root, animate = false) {
  const visible = WORKS.filter((w) => area === 'all' || w.systems.includes(area));
  if (!visible.some((w) => w.id === picked)) { picked = visible[0].id; animate = true; }

  root.querySelectorAll('[data-area]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.area === area)));
  root.querySelectorAll('[data-roster]').forEach((li) => { li.hidden = !visible.some((w) => w.id === li.dataset.roster); });
  root.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pick === picked)));
  root.querySelectorAll('.cc-work').forEach((el) => {
    const on = el.dataset.work === picked;
    el.classList.toggle('on', on);
    if (on && animate) { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); }
  });
  root.querySelector('[data-overview]').hidden = area !== 'all';
  root.querySelectorAll('[data-panel]').forEach((p) => p.classList.toggle('off', p.dataset.panel !== area));
  readout(root.querySelector('#ccReadout'));
  setMiniArea(area === 'all' ? null : area);
}

export function initConsole(root) {
  ac?.abort();
  ac = new AbortController();
  const { signal } = ac;

  const hash = location.hash.match(/^#work-(.+)$/)?.[1];
  if (hash && WORKS.some((w) => w.id === hash)) { picked = hash; area = 'all'; }

  root.addEventListener('click', (e) => {
    const areaBtn = e.target.closest('[data-area]');
    if (areaBtn) {
      const id = areaBtn.dataset.area;
      /* o mapa e os cartões levam à seção da área; as abas só filtram onde estão */
      const go = areaBtn.matches('.cc-node, .cc-acard, .cc-sysrow');
      area = go || id !== area ? id : 'all';
      apply(root, true);
      if (go) {
        const panel = root.querySelector(`[data-panel="${id}"]`);
        panel.scrollIntoView();
        panel.focus({ preventScroll: true });
      }
      return;
    }
    const pick = e.target.closest('[data-pick]');
    if (pick) { picked = pick.dataset.pick; apply(root, true); return; }
    const show = e.target.closest('[data-show]');
    if (show) {
      picked = show.dataset.show;
      if (area !== 'all' && !worksFor(area).some((w) => w.id === picked)) area = 'all';
      apply(root, true);
      root.querySelector('#sec-trabalhos').scrollIntoView();
    }
  }, { signal });

  /* luz que acompanha o cursor sobre os painéis */
  if (matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
    let raf = 0, last = null;
    root.addEventListener('pointermove', (e) => {
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = last.target.closest?.('.cc-plate, .cc-acard, .cc-kpis > div');
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${Math.round(last.clientX - r.left)}px`);
        el.style.setProperty('--my', `${Math.round(last.clientY - r.top)}px`);
      });
    }, { signal, passive: true });
  }

  /* impressão e PDF saem com tudo aberto */
  let closed = [];
  addEventListener('beforeprint', () => {
    closed = [...root.querySelectorAll('details:not([open])')];
    closed.forEach((d) => { d.open = true; });
  }, { signal });
  addEventListener('afterprint', () => { closed.forEach((d) => { d.open = false; }); }, { signal });

  /* destaca na barra a seção que está na tela */
  spy?.disconnect();
  const links = new Map([...root.querySelectorAll('.cc-jump a')].map((a) => [a.dataset.sec, a]));
  const sector = root.querySelector('#ccSector');
  spy = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      links.forEach((a) => a.removeAttribute('aria-current'));
      const a = links.get(en.target.id.slice(4));
      sector.textContent = a ? a.dataset.name : T().ui.dockBridge;
      /* a rota do menu fica acesa até o setor atual */
      let passed = !!a;
      links.forEach((l) => { if (l === a) passed = false; l.classList.toggle('past', passed); });
      document.documentElement.style.setProperty('--sky', SKY[en.target.id.slice(4)] || SKY.top);
      if (!a) continue;
      a.setAttribute('aria-current', 'true');
      const bar = a.parentElement;
      if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: a.offsetLeft - 28, behavior: 'smooth' });
    }
  }, { rootMargin: '-35% 0px -60% 0px' });
  root.querySelectorAll('.cc-sec, .cc-hero').forEach((s) => spy.observe(s));

  apply(root);
}
