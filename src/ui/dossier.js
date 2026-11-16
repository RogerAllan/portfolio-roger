/* Dossiê (painel da direita): abre um sistema depois do salto, abre o resumo
   técnico sem viajar, fecha voltando ao mapa. No modo lista, tudo vira uma
   página corrida. */
import { SYSTEMS } from '../content/index.js';
import { state, $ } from './state.js';
import { systemBlock, summaryBlock } from './templates.js';
import { strike, updateBossCount } from './anomalies.js';
import { preloadDefeats } from './defeat.js';
import { markNav, updateMapped } from './nav.js';
import * as sfx from '../fx/audio.js';

const dossier = () => $('dossier');
const dBody = () => $('dBody');
let arriveTimer = 0;

function toggleEntry(btn, force) {
  const open = force ?? btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', String(open));
  $(btn.getAttribute('aria-controls')).hidden = !open;
  btn.closest('.entry').classList.toggle('open', open);
  sfx.tick();
}

/* liga os eventos de um bloco recém-renderizado */
export function bind(root) {
  root.querySelectorAll('.e-btn').forEach((btn) => {
    const i = +btn.closest('.entry').dataset.i;
    btn.addEventListener('click', () => toggleEntry(btn));
    btn.addEventListener('mouseenter', () => state.galaxy?.planetHover(i));
    btn.addEventListener('mouseleave', () => state.galaxy?.planetHover(-1));
    btn.addEventListener('focus', () => state.galaxy?.planetHover(i));
  });
  root.querySelector('[data-explore]')?.addEventListener('click', closeDossier);
  const bosses = root.querySelectorAll('.boss .b-strike');
  bosses.forEach((b) => b.addEventListener('click', (e) => strike(b.closest('.boss'), e.currentTarget)));
  if (bosses.length) preloadDefeats();
  updateBossCount();
}

function render(id) {
  dBody().innerHTML = id === 'resumo' ? summaryBlock() : systemBlock(id);
  bind(dBody());
}

function show(id) {
  const d = dossier();
  render(id);
  d.hidden = false;
  d.classList.toggle('q', id === 'incidentes');
  d.scrollTop = 0;
  markNav();
  $('backBtn').focus({ preventScroll: true });
}

export function openSystem(id) {
  if (!SYSTEMS.find((s) => s.id === id)) return;
  if (state.flatMode || !state.galaxy) { $('sec-' + id)?.scrollIntoView(); return; }
  state.openId = id;
  dossier().hidden = true;
  state.galaxy.goTo(id);
  sfx.warp();
  clearTimeout(arriveTimer);
  arriveTimer = setTimeout(() => onArrived(id), 3000); /* reserva se o evento não vier */
  state.visited.add(id);
  updateMapped();
  history.replaceState(null, '', '#' + id);
}

export function onArrived(id) {
  if (state.openId !== id) return;
  clearTimeout(arriveTimer);
  show(id);
}

export function openSummary() {
  if (document.body.classList.contains('booting')) {
    document.body.classList.remove('booting');
    state.galaxy?.start(true);
  }
  if (state.flatMode || !state.galaxy) { $('sec-resumo')?.scrollIntoView(); return; }
  state.openId = 'resumo';
  clearTimeout(arriveTimer);
  show('resumo');
  history.replaceState(null, '', '#resumo');
}

export function closeDossier() {
  if (!state.openId) return;
  state.openId = null;
  dossier().hidden = true;
  markNav();
  state.galaxy?.toMap();
  sfx.warp();
  history.replaceState(null, '', location.pathname);
}

/* re-render após troca de idioma */
export function refreshDossier() {
  if (state.openId && !dossier().hidden) render(state.openId);
}

/* clique/hover num planeta na cena destaca a técnica correspondente */
export function highlightTech(i, click) {
  dBody().querySelectorAll('.entry').forEach((li) => li.classList.toggle('lit', +li.dataset.i === i));
  if (!click || i < 0) return;
  const btn = dBody().querySelector(`.entry[data-i="${i}"] .e-btn`);
  if (!btn) return;
  toggleEntry(btn, true);
  btn.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

export function initDossier() {
  $('backBtn').addEventListener('click', closeDossier);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDossier(); });
  $('summaryBoot').addEventListener('click', openSummary);
  $('summaryHud').addEventListener('click', openSummary);
}
