/* Tela de carregamento (markup e CSS inline no index.html).
   Etapas com peso fixo, registradas de uma vez, para o progresso nunca voltar.
   Cada etapa conclui ao resolver, ao falhar ou ao estourar o tempo-limite:
   o loader nunca fica preso. finish() espera todas, deixa o número chegar a
   100 % e só então revela a abertura. */
import { T, $, reduce } from './state.js';

const STEP_TIMEOUT = 25000;

export function createLoader(steps) {
  const el = $('loader');
  const pctEl = $('ldPct'), stepEl = $('ldStep');
  const tasks = steps.map(([key, weight]) => ({ key, weight, frac: 0, done: false }));
  const total = tasks.reduce((s, t) => s + t.weight, 0);
  const byKey = Object.fromEntries(tasks.map((t) => [t.key, t]));
  let shown = 0, target = 0, raf = 0, last = performance.now();
  let allDone, ended = false;
  const finished = new Promise((r) => { allDone = r; });

  $('ldTitle').textContent = T().ui.loading.title;

  function recompute() {
    target = tasks.reduce((s, t) => s + t.weight * (t.done ? 1 : t.frac), 0) / total;
    const pending = tasks.find((t) => !t.done);
    stepEl.textContent = T().ui.loading[pending ? pending.key : 'done'];
    if (!pending) allDone();
  }

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    shown = Math.min(target, shown + Math.max((target - shown) * dt * 5, dt * 0.08));
    if (reduce) shown = target;
    const p = Math.floor(shown * 100);
    pctEl.textContent = p;
    el.style.setProperty('--p', shown.toFixed(3));
    window.__ldGL?.set(shown);
    el.setAttribute('aria-valuenow', p);
    if (!ended) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  const complete = (key) => { const t = byKey[key]; if (t && !t.done) { t.done = true; recompute(); } };

  return {
    /* conclui a etapa quando a promise terminar (sucesso, erro ou tempo-limite) */
    track(key, promise, timeout = STEP_TIMEOUT) {
      const timer = new Promise((r) => setTimeout(r, timeout));
      Promise.race([Promise.resolve(promise).catch(() => {}), timer]).then(() => complete(key));
      return promise;
    },
    progress(key, frac) { const t = byKey[key]; if (t && !t.done) { t.frac = Math.max(t.frac, Math.min(1, frac)); recompute(); } },
    done: complete,
    /* espera tudo, completa o número e some; resolve quando a abertura aparece */
    async finish() {
      await finished;
      await new Promise((r) => { const check = () => (shown >= 0.999 ? r() : requestAnimationFrame(check)); check(); });
      await new Promise((r) => setTimeout(r, reduce ? 0 : 250));
      ended = true;
      cancelAnimationFrame(raf);
      window.__ldGL?.flare();
      await new Promise((r) => setTimeout(r, reduce ? 0 : 280));
      el.classList.add('done');
      document.body.classList.remove('loading');
      setTimeout(() => { window.__ldGL?.stop(); el.remove(); }, 1400);
    }
  };
}

/* baixa e decodifica uma lista de imagens, avisando a fração concluída
   (as referências ficam guardadas para o navegador manter o cache) */
const kept = [];
export function preloadImages(urls, onProgress) {
  if (!urls.length) return Promise.resolve();
  let n = 0;
  return Promise.all(urls.map((src) => {
    const im = new Image();
    kept.push(im);
    im.decoding = 'async';
    im.src = src;
    return im.decode().catch(() => {}).then(() => { n += 1; onProgress?.(n / urls.length); });
  }));
}
