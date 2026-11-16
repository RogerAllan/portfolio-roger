/* Contenção das anomalias: três golpes (escanear, analisar, neutralizar),
   cada um revela uma fase do post-mortem. Quadro de impacto em estilo mangá. */
import { state, T, $, reduce } from './state.js';
import { toast } from './toast.js';
import * as sfx from '../fx/audio.js';
import { playDefeat } from './defeat.js';
import { hasCutscene, playCutscene } from './cutscene.js';
import { duck } from '../fx/music.js';

const ONO = ['ドン', 'ズドン', 'バキッ', 'ゴゴゴ', 'ドゴォ'];

export function impact(x, y, big) {
  state.galaxy?.shake(big ? 1.4 : 0.5);
  if (reduce) return;
  const im = $('impact');
  im.style.setProperty('--x', x + 'px');
  im.style.setProperty('--y', y + 'px');
  $('ono').textContent = ONO[Math.floor(Math.random() * ONO.length)] + (big ? '!!' : '!');
  im.classList.remove('on', 'big');
  void im.offsetWidth;
  im.classList.add('on');
  if (big) im.classList.add('big');
}

export function updateBossCount() {
  const n = state.bossHits.filter((h) => h >= 3).length;
  const text = T().ui.bossCount.replace('{n}', n).replace('{t}', state.bossHits.length);
  document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = text; });
}

export function strike(card, btn) {
  const i = +card.dataset.b;
  if (state.bossHits[i] >= 3) return;
  const h = ++state.bossHits[i];
  const t = T();
  const r = btn.getBoundingClientRect();
  card.querySelector('.b-hp-fill').style.setProperty('--hp', (3 - h) / 3);
  card.querySelector('.b-hp').setAttribute('aria-valuenow', 3 - h);
  card.querySelectorAll('.b-phases li')[h - 1].hidden = false;
  card.classList.remove('hurt');
  void card.offsetWidth;
  card.classList.add('hurt');

  if (h < 3) {
    btn.textContent = h === 1 ? t.ui.strikeAgain : t.ui.finish;
    sfx.hit();
    impact(r.left + r.width / 2, r.top, false);
    return;
  }
  btn.hidden = true;
  card.querySelector('.b-code').hidden = false;
  card.querySelector('.b-stamp').hidden = false;
  card.classList.add('dead');
  if (hasCutscene(i)) {
    duck(9);   /* a trilha fica baixa durante toda a cutscene */
    playCutscene(i, T().bosses[i].name).then(() => playDefeat(card, i));
  } else {
    duck();
    playDefeat(card, i);
  }
  sfx.collapse();
  impact(r.left + r.width / 2, r.top, true);
  updateBossCount();
  if (!state.bossToast && state.bossHits.every((v) => v >= 3)) {
    state.bossToast = true;
    setTimeout(() => toast(T().ui.toastBosses), 900);
  }
}
