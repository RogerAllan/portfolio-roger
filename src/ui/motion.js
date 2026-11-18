/* Motion do centro de comando. A abertura liga o console uma única vez; depois,
   a rolagem é a viagem: estrelas com rastro de dobra conforme a velocidade, barra
   de progresso, títulos lidos como sinal e o print deslizando na tela principal.
   Com prefers-reduced-motion nada disso liga. */
import { reduce, $ } from './state.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const GLYPHS = '#/\\<>01%+=*';

let sky = null;
function ensureSky() {
  if (sky) return sky;
  const cv = document.createElement('canvas');
  cv.id = 'pgStars';
  cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  let w = 0, h = 0, stars = [];
  const resize = () => {
    const k = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    cv.width = Math.round(w * k); cv.height = Math.round(h * k);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    const n = Math.min(170, Math.round((w * h) / 8000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      z: 0.15 + Math.random() ** 2 * 0.85, t: Math.random() * 6.28
    }));
  };
  const draw = (scroll, vel, now) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ctx.strokeStyle = '#cfd9e6';
    const streak = Math.min(170, Math.abs(vel) * 1.8);
    for (const s of stars) {
      const y = (((s.y - scroll * s.z * 0.28) % h) + h) % h;
      const size = 0.6 + s.z;
      ctx.globalAlpha = (0.14 + 0.42 * s.z) * (0.8 + 0.2 * Math.sin(now * 0.0012 + s.t));
      const len = streak * s.z;
      if (len < 1.5) { ctx.fillRect(s.x, y, size, size); continue; }
      ctx.lineWidth = size;
      ctx.beginPath(); ctx.moveTo(s.x, y); ctx.lineTo(s.x, y + Math.sign(vel) * len); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  resize();
  sky = { resize, draw };
  return sky;
}

function decode(el) {
  const final = el.textContent;
  const t0 = performance.now();
  const tick = (now) => {
    const k = clamp((now - t0) / 600);
    if (k >= 1 || !el.isConnected) { el.textContent = final; return; }
    const done = Math.floor(k * final.length);
    el.textContent = final.slice(0, done) + [...final.slice(done)].map(() => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('');
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

let dispose = null;
let booted = false;

export function initPageMotion(root) {
  dispose?.();
  dispose = null;
  if (reduce) return;

  const html = document.documentElement;
  html.classList.add('mo');
  const stars = ensureSky();
  const ac = new AbortController();
  addEventListener('resize', () => { stars.resize(); }, { signal: ac.signal });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      const code = e.target.querySelector(':scope > .cc-code');
      if (code) decode(code);
      io.unobserve(e.target);
    }
  }, { threshold: 0.15 });
  root.querySelectorAll('.cc-head').forEach((el) => io.observe(el));

  const hero = root.querySelector('.cc-hero');
  const counters = [...root.querySelectorAll('[data-count]')].map((el) => {
    const m = el.dataset.count.match(/^(\D*)(\d+)(\D*)$/);
    return { el, pre: m[1], n: +m[2], suf: m[3] };
  });
  if (booted) { hero.classList.add('go', 'done'); counters.length = 0; }
  else counters.forEach((c) => { c.el.textContent = `${c.pre}0${c.suf}`; });

  let t0 = 0, lastY = scrollY, vel = 0, raf = 0;
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const y = scrollY, vh = innerHeight;
    vel += (y - lastY - vel) * 0.18;
    lastY = y;
    html.style.setProperty('--prog', clamp(y / Math.max(1, html.scrollHeight - vh)).toFixed(4));
    stars.draw(y, vel, now);

    const shot = root.querySelector('.cc-work.on .cc-shot');
    if (shot) {
      const r = shot.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const k = clamp((vh - r.top) / (vh + r.height));
        shot.firstElementChild.style.transform = `translate3d(0, ${(-k * 8.3).toFixed(2)}%, 0)`;
      }
    }

    const loader = $('loader');
    if (!t0 && !booted && (!loader || loader.classList.contains('done'))) {
      t0 = now; booted = true; hero.classList.add('go');
    }
    if (t0 && counters.length) {
      const k = clamp((now - t0 - 700) / 1500);
      const e = 1 - (1 - k) ** 3;
      counters.forEach((c) => { c.el.textContent = `${c.pre}${Math.round(c.n * e)}${c.suf}`; });
      if (k >= 1) counters.length = 0;
    }
  };
  raf = requestAnimationFrame(frame);

  dispose = () => { cancelAnimationFrame(raf); ac.abort(); io.disconnect(); };
}
