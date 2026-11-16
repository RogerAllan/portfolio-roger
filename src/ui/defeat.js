/* Animação de derrota das anomalias: sequência de frames (manifest.defeat[i])
   tocada no retrato no golpe final. Primeiros frames mais rápidos (impacto),
   depois a desintegração; termina na cena vazia contida. */
import { state, reduce } from './state.js';
import { assetUrl } from '../fx/logo-frames.js';

const cache = new Map();

function frames(i) {
  const list = state.manifest?.defeat?.[i];
  if (!list) return null;
  if (!cache.has(i)) {
    cache.set(i, list.map((p) => { const im = new Image(); im.decoding = 'async'; im.src = assetUrl(p); return im; }));
  }
  return cache.get(i);
}

/* baixa tudo ao abrir o painel, para a animação não engasgar no clique */
export function preloadDefeats() {
  (state.manifest?.defeat || []).forEach((_, i) => frames(i));
}

/* frame final de uma anomalia já contida (ou null se não houver animação) */
export const finalFrame = (i) => {
  const list = state.manifest?.defeat?.[i];
  return list ? assetUrl(list[list.length - 1]) : null;
};

export function playDefeat(card, i) {
  const img = card.querySelector('.b-portrait');
  const seq = frames(i);
  if (!img || !seq) return false;
  card.classList.add('animated');
  if (reduce) { img.src = seq[seq.length - 1].src; return true; }
  let k = 0;
  const step = () => {
    img.src = seq[k].src;
    k += 1;
    if (k < seq.length) setTimeout(step, k < 3 ? 70 : 120);
  };
  step();
  return true;
}
