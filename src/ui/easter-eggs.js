/* Código Konami: colapso (acorde que afunda + tremores espaçados). */
import { state, T, reduce } from './state.js';
import { toast } from './toast.js';
import * as sfx from '../fx/audio.js';
import { duck } from '../fx/music.js';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const SHAKES = [[0, 0.9], [900, 0.5], [2100, 0.3]];   /* [ms, intensidade] */

export function initEasterEggs() {
  let i = 0;
  addEventListener('keydown', (e) => {
    i = e.key === KONAMI[i] ? i + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (i < KONAMI.length) return;
    i = 0;
    toast(T().ui.toastKonami);
    duck();
    sfx.collapse();
    if (!reduce) SHAKES.forEach(([ms, k]) => setTimeout(() => state.galaxy?.shake(k), ms));
  });
}
