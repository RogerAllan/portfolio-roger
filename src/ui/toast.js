/* Aviso curto no topo da tela. */
import { $ } from './state.js';

let timer = 0;

export function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('show'), 4200);
}
