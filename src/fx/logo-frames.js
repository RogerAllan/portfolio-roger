/* Player do logo em frames: toca a inicialização (holograma ligando) uma vez e
   depois fica num loop de respiração (ida e volta). Ponteiro por cima acelera.
   Só substitui o logo em texto quando todos os frames carregaram. */

const BASE = '/assets/gen/';

export async function loadManifest() {
  try {
    const r = await fetch(BASE + 'manifest.json', { cache: 'no-cache' });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export const assetUrl = (p) => BASE + p;

function load(src) {
  return new Promise((ok, fail) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => ok(im);
    im.onerror = fail;
    im.src = assetUrl(src);
  });
}

export async function playLogo(host, logo, name, reduce) {
  const grow = logo.boot || logo.grow || [], ember = logo.idle || logo.ember || [];
  let frames;
  try {
    frames = await Promise.all([logo.master, ...grow, ...ember].map(load));
  } catch { return false; }
  const [master, ...rest] = frames;
  const g = rest.slice(0, grow.length), e = rest.slice(grow.length);

  const cv = document.createElement('canvas');
  cv.width = logo.w; cv.height = logo.h;
  cv.className = 'logo-cv';
  cv.setAttribute('role', 'img');
  cv.setAttribute('aria-label', name);
  const c = cv.getContext('2d');
  const draw = (im, a = 1) => { c.clearRect(0, 0, cv.width, cv.height); c.globalAlpha = a; c.drawImage(im, 0, 0, cv.width, cv.height); c.globalAlpha = 1; };

  host.replaceChildren(cv);
  host.classList.add('frames');
  if (reduce || !g.length) { draw(master); return true; }

  /* crescimento: 14 fps */
  let i = 0;
  await new Promise((done) => {
    const step = () => {
      draw(g[i]);
      i++;
      if (i < g.length) setTimeout(step, 1000 / 14); else done();
    };
    step();
  });
  if (!e.length) { draw(master); return true; }

  /* brasa: ida e volta com cross-fade entre frames vizinhos */
  const seq = [master, ...e];
  let t = 0, last = performance.now(), hot = false;
  host.addEventListener('pointerenter', () => { hot = true; });
  host.addEventListener('pointerleave', () => { hot = false; });
  const loop = (now) => {
    requestAnimationFrame(loop);
    if (document.hidden) { last = now; return; }
    t += (now - last) / 1000 * (hot ? 2.6 : 0.9);
    last = now;
    const n = seq.length - 1;
    const p = (Math.sin(t) * 0.5 + 0.5) * n;   /* 0 … n */
    const a = Math.floor(p), f = p - a;
    draw(seq[a]);
    if (a < n) { c.globalAlpha = f; c.drawImage(seq[a + 1], 0, 0, cv.width, cv.height); c.globalAlpha = 1; }
  };
  requestAnimationFrame(loop);
  return true;
}
