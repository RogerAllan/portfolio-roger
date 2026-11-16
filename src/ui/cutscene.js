/* Cutscene de derrota: vídeo em tela cheia com faixas de cinema, tocado no
   golpe final de uma anomalia. Vídeos em public/assets/cutscene/aN.mp4,
   listados em public/assets/cutscene/manifest.json ({ "videos": ["a1.mp4", …] },
   índice = anomalia). Pular: botão, Esc ou clique. Sem vídeo, não faz nada. */
import { T, $, esc } from './state.js';

const BASE = '/assets/cutscene/';
let videos = [];
let closeCurrent = null;

let ready = Promise.resolve();
export function loadCutscenes() { ready = load(); return ready; }
async function load() {
  try {
    const r = await fetch(BASE + 'manifest.json', { cache: 'no-cache' });
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return;
    videos = (await r.json()).videos || [];
  } catch { /* sem cutscenes */ }
}

export const hasCutscene = (i) => !!videos[i];

/* baixa os vídeos um por um em segundo plano (depois do carregamento) e passa
   a tocar da memória: o golpe final não espera rede */
const blobs = [];
export async function preloadCutscenes() {
  await ready;
  for (let i = 0; i < videos.length; i++) {
    if (!videos[i]) continue;
    try {
      const r = await fetch(BASE + videos[i]);
      if (r.ok) blobs[i] = URL.createObjectURL(await r.blob());
    } catch { /* toca direto da rede */ }
  }
}

/* toca a cutscene da anomalia i; resolve quando termina ou é pulada */
export function playCutscene(i, name) {
  if (!videos[i]) return Promise.resolve(false);
  const box = $('cutscene');
  const video = box.querySelector('video');
  box.querySelector('.cs-title').innerHTML = esc(name);
  box.querySelector('.cs-stamp').textContent = T().ui.defeated;
  box.querySelector('.cs-skip').textContent = T().ui.skip;
  video.src = blobs[i] || BASE + videos[i];
  box.hidden = false;
  box.classList.remove('ended');
  requestAnimationFrame(() => box.classList.add('on'));

  return new Promise((done) => {
    const finish = () => {
      if (!closeCurrent) return;
      closeCurrent = null;
      box.classList.add('ended');
      video.pause();
      setTimeout(() => {
        box.classList.remove('on');
        setTimeout(() => { box.hidden = true; video.removeAttribute('src'); video.load(); done(true); }, 450);
      }, 900);
    };
    closeCurrent = finish;
    video.onended = finish;
    video.onerror = finish;
    video.play().catch(finish);
  });
}

export function initCutscene() {
  const box = $('cutscene');
  box.querySelector('.cs-skip').addEventListener('click', (e) => { e.stopPropagation(); closeCurrent?.(); });
  box.addEventListener('click', () => closeCurrent?.());
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && closeCurrent) { e.stopImmediatePropagation(); closeCurrent(); } }, true);
}
