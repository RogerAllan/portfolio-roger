/* Navegação lateral: lista de sistemas, contagem de mapeados e o destaque
   sincronizado com o hover na cena. */
import { SYSTEMS } from '../content/index.js';
import { state, T, $, esc } from './state.js';
import { openSystem } from './dossier.js';
import { toast } from './toast.js';
import * as sfx from '../fx/audio.js';

const list = () => $('navList');

export function renderNav() {
  list().innerHTML = SYSTEMS.map((S) => {
    const tx = T().layers[S.id];
    const href = state.flatMode ? `#sec-${S.id}` : `#${S.id}`;
    return `<li><a class="n-btn${S.id === 'incidentes' ? ' n-q' : ''}" href="${href}" data-id="${S.id}">
      <span class="n-code">${S.code}</span><span class="n-name">${esc(tx.name)}</span><span class="n-sub">${esc(tx.sub)}</span></a></li>`;
  }).join('');
  list().querySelectorAll('.n-btn').forEach((a) => {
    a.addEventListener('click', (e) => { if (!state.flatMode) { e.preventDefault(); openSystem(a.dataset.id); } });
    a.addEventListener('mouseenter', () => { state.galaxy?.highlight(a.dataset.id); sfx.tick(); });
    a.addEventListener('mouseleave', () => state.galaxy?.highlight(null));
  });
  markNav();
}

export function markNav() {
  list().querySelectorAll('.n-btn').forEach((a) => {
    if (a.dataset.id === state.openId) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
    a.classList.toggle('seen', state.visited.has(a.dataset.id));
  });
}

export function updateMapped() {
  $('mapped').textContent = T().ui.mapped.replace('{n}', state.visited.size).replace('{t}', SYSTEMS.length);
  markNav();
  if (!state.mapToast && state.visited.size === SYSTEMS.length) {
    state.mapToast = true;
    setTimeout(() => toast(T().ui.toastMap), 2600);
  }
}

/* hover num sistema dentro da cena */
export function highlightNav(id) {
  list().querySelectorAll('.n-btn').forEach((a) => a.classList.toggle('hl', a.dataset.id === id));
  if (id) sfx.tick();
}

export function initNav() {
  $('callsign').addEventListener('click', () => openSystem('sobre'));
}
