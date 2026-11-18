/* Liga a miniatura 3D ao radar do centro de comando. O motor só é baixado depois
   que a página abriu; até lá, e sempre que não houver WebGL ou o visitante pedir
   menos movimento, o radar em SVG continua no lugar. */
import { SYSTEMS, TEXT } from '../content/index.js';
import { state, can3D, $ } from './state.js';
import { assetUrl } from '../fx/logo-frames.js';

const SHOWN = SYSTEMS.filter((S) => S.id !== 'sobre');
const canvas = document.createElement('canvas');
canvas.className = 'cc-mini';
canvas.setAttribute('aria-hidden', 'true');

let mini = null, starting = false, failed = false, area = null;
let scope = null, sized = null, seen = null;

const loaderGone = () => new Promise((resolve) => {
  const check = () => {
    const l = $('loader');
    if (!l || l.classList.contains('done')) setTimeout(resolve, 1400);   /* deixa a abertura terminar */
    else setTimeout(check, 200);
  };
  check();
});

/* coloca a miniatura no radar atual (a página é refeita ao trocar de idioma) */
function attach() {
  if (!mini || !scope?.isConnected) return;
  scope.prepend(canvas);
  mini.resize();
  sized?.disconnect();
  sized = new ResizeObserver(() => mini.resize());
  sized.observe(scope);
  seen?.disconnect();
  seen = new IntersectionObserver(([e]) => mini.setVisible(e.isIntersecting));
  seen.observe(scope);

  const items = [...scope.querySelectorAll('.cc-node')].map((el) => ({ el, id: el.dataset.area }));
  const core = scope.querySelector('.cc-core');
  let sided = false;
  mini.setOnFrame((pos) => {
    const w = scope.clientWidth, h = scope.clientHeight;
    for (const { el, id } of items) {
      const p = pos[id];
      el.style.setProperty('--px', `${(p.x * w).toFixed(1)}px`);
      el.style.setProperty('--py', `${(p.y * h).toFixed(1)}px`);
      if (!sided) { const r = p.x * 2 - 1; el.classList.toggle('is-l', r > 0.3 || (r < 0 && r > -0.45)); }
    }
    core.style.setProperty('--px', `${(pos.incidentes.x * w).toFixed(1)}px`);
    core.style.setProperty('--py', `${(pos.incidentes.y * h).toFixed(1)}px`);
    sided = true;
    scope.classList.add('has-mini');
  });
}

export function setMiniArea(id) {
  area = id;
  mini?.setActive(id);
}

export async function mountMiniGalaxy(root) {
  scope = root.querySelector('.cc-scope');
  if (!can3D || failed) return;
  if (mini) { attach(); return; }
  if (starting || !state.manifest) return;
  starting = true;
  try {
    await loaderGone();
    scope.prepend(canvas);
    const { initMiniGalaxy } = await import('../scene/mini.js');
    const instance = initMiniGalaxy({
      canvas,
      systems: SHOWN,
      techCounts: Object.fromEntries(SHOWN.map((S) => [S.id, S.id === 'incidentes' ? TEXT.pt.bosses.length : TEXT.pt.layers[S.id].techs.length])),
      nebulaUrls: (state.manifest.nebula || []).map(assetUrl)
    });
    canvas.addEventListener('webglcontextlost', () => {
      failed = true;
      instance.stop();
      mini = null;
      scope?.classList.remove('has-mini');
      canvas.remove();
    }, { once: true });
    await instance.ready;
    instance.setActive(area);
    mini = instance;
    attach();
  } catch (err) {
    console.error(err);
    failed = true;
    canvas.remove();
  }
}
