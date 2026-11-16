/* Trilha de fundo: public/audio/theme.mp3, em loop.
   Só toca depois que o visitante liga o som (nunca autoplay). Entra e sai com
   fade e abaixa durante o golpe final e a cutscene das anomalias. Sem o arquivo, nada muda. */

const SRC = '/audio/theme.mp3';
const VOLUME = 0.35;

let el = null;
let wanted = false;
let fadeRaf = 0;

/* confere se o arquivo existe (o servidor de dev devolve HTML para rota ausente) */
export async function initMusic() {
  try {
    const r = await fetch(SRC, { method: 'HEAD' });
    if (!r.ok || !(r.headers.get('content-type') || '').startsWith('audio')) return false;
    el = new Audio(SRC);
    el.loop = true;
    el.preload = 'none';
    el.volume = 0;
    return true;
  } catch { return false; }
}

/* depois do carregamento: começa a baixar a trilha para o primeiro play ser imediato */
export function warmMusic() {
  if (!el || el.preload === 'auto') return;
  el.preload = 'auto';
  el.load();
}

function fadeTo(target, ms = 1200, done) {
  cancelAnimationFrame(fadeRaf);
  const from = el.volume, t0 = performance.now();
  const step = (now) => {
    /* o timestamp do rAF pode ser anterior a t0: sem a trava, k < 0 e o volume sai de [0, 1] */
    const k = Math.min(1, Math.max(0, (now - t0) / ms));
    el.volume = from + (target - from) * k;
    if (k < 1) fadeRaf = requestAnimationFrame(step);
    else if (done) done();
  };
  fadeRaf = requestAnimationFrame(step);
}

export function setMusic(on) {
  wanted = on;
  if (!el) return;
  if (on) { el.play().catch(() => {}); fadeTo(VOLUME); }
  else fadeTo(0, 900, () => { if (!wanted) el.pause(); });
}

/* abaixa por alguns segundos (golpe final, cutscene) e volta */
export function duck(seconds = 3.5) {
  if (!el || !wanted) return;
  fadeTo(VOLUME * 0.25, 250, () => setTimeout(() => { if (wanted) fadeTo(VOLUME, 1200); }, seconds * 1000));
}
