/* Print ampliado: qualquer [data-zoom] abre a imagem num <dialog>.
   Clique em qualquer lugar ou Esc fecha. */
import { T, $ } from './state.js';

export function initZoom() {
  const dlg = $('zoom');
  const img = dlg.querySelector('img');
  const close = dlg.querySelector('button');
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-zoom]');
    if (!btn) return;
    img.src = btn.dataset.zoom;
    close.textContent = T().ui.worksClose;
    dlg.showModal();
  });
  dlg.addEventListener('click', () => dlg.close());
}
