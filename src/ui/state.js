/* Estado compartilhado da interface e helpers de DOM. */
import { LANGS, TEXT } from '../content/index.js';

export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const hasWebGL = (() => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
})();

function initialLang() {
  let l = null;
  try { l = localStorage.getItem('lang'); } catch { /* sem storage */ }
  if (LANGS.includes(l)) return l;
  const nav = (navigator.language || 'pt').slice(0, 2);
  return LANGS.includes(nav) ? nav : 'en';
}

/* a versão em página é a entrada do site; a carta estelar 3D é opcional (?view=3d)
   e só abre com WebGL e sem o pedido de menos movimento */
const wants3D = new URLSearchParams(location.search).get('view') === '3d';
export const can3D = hasWebGL && !reduce;

export const state = {
  lang: initialLang(),
  galaxy: null,                 /* API da cena, ou null no modo lista */
  manifest: null,               /* imagens geradas (logo, anomalias, insígnias, nebulosas) */
  credits: [],                  /* créditos dos modelos 3D */
  openId: null,                 /* id do sistema aberto no dossiê, ou 'resumo' */
  visited: new Set(),
  bossHits: TEXT.pt.bosses.map(() => 0),
  flatMode: !(wants3D && can3D),
  mapToast: false,
  bossToast: false
};

export const T = () => TEXT[state.lang];

export function saveLang(l) {
  state.lang = l;
  try { localStorage.setItem('lang', l); } catch { /* ok */ }
}

export const $ = (id) => document.getElementById(id);
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
