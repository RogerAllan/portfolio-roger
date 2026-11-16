/* Ponto de entrada: fontes, estilos, idioma, interface e a cena 3D. */
import '@fontsource-variable/tektur/standard.css';
import '@fontsource-variable/spline-sans';
import '@fontsource-variable/jetbrains-mono';
import './styles/index.css';
import { SYSTEMS, TEXT } from './content/index.js';
import { state, T, $, saveLang, reduce, can3D } from './ui/state.js';
import { renderNav, updateMapped, highlightNav, initNav } from './ui/nav.js';
import { initDossier, openSystem, openSummary, onArrived, highlightTech, refreshDossier } from './ui/dossier.js';
import { renderPage } from './ui/page.js';
import { initEasterEggs } from './ui/easter-eggs.js';
import { initCutscene, loadCutscenes, preloadCutscenes } from './ui/cutscene.js';
import { createLoader, preloadImages } from './ui/loader.js';
import { loadManifest, playLogo, assetUrl } from './fx/logo-frames.js';
import * as sfx from './fx/audio.js';
import { initMusic, setMusic, warmMusic } from './fx/music.js';

if (state.flatMode) document.body.classList.add('flat-mode');

/* troca entre a carta estelar e a versão em página (mantém o resto da URL) */
function viewHref(page) {
  const u = new URL(location.href);
  if (page) u.searchParams.set('view', 'page'); else u.searchParams.delete('view');
  u.hash = '';
  return u.pathname + u.search;
}

const systemNames = () => Object.fromEntries(SYSTEMS.map((S) => [S.id, T().layers[S.id].name]));
/* o que cada planeta representa: técnicas (título + problema) ou, nos incidentes, anomalias (nome + sintoma) */
const planetInfo = () => Object.fromEntries(SYSTEMS.map((S) => [S.id, S.id === 'incidentes'
  ? T().bosses.map((b) => ({ t: b.name, d: b.s }))
  : (T().layers[S.id].techs || []).map((x) => ({ t: x.t, d: x.p }))]));

function applyLang(l) {
  saveLang(l);
  const t = T();
  document.documentElement.lang = t.ui.htmlLang;
  document.querySelectorAll('[data-t]').forEach((el) => {
    const v = t.ui[el.dataset.t];
    if (typeof v === 'string') el.innerHTML = v;
  });
  $('langGroup').setAttribute('aria-label', t.ui.langLabel);
  document.querySelectorAll('#langGroup button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
  $('soundLabel').textContent = sfx.isOn() ? t.ui.soundOn : t.ui.soundOff;
  renderNav();
  updateMapped();
  state.galaxy?.setLabels(systemNames());
  state.galaxy?.setPlanetInfo(planetInfo());
  const vb = $('viewBtn');
  vb.hidden = state.flatMode && !can3D;
  vb.href = viewHref(!state.flatMode);
  vb.querySelector('span').textContent = state.flatMode ? t.ui.view3d : t.ui.viewPage;
  vb.setAttribute('aria-label', vb.querySelector('span').textContent);
  if (state.flatMode) renderPage();
  else refreshDossier();
}

function initControls() {
  document.querySelectorAll('#langGroup button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));
  $('soundBtn').addEventListener('click', () => {
    const on = !sfx.isOn();
    sfx.setSound(on);
    setMusic(on);
    $('soundBtn').setAttribute('aria-pressed', String(on));
    $('soundLabel').textContent = on ? T().ui.soundOn : T().ui.soundOff;
  });
  $('engage').addEventListener('click', engage);
}

/* "Iniciar navegação": atravessa o portal; se a URL tiver #sistema, abre depois */
function engage() {
  document.body.classList.remove('booting');
  sfx.warp();
  state.galaxy?.start(false);
  const target = location.hash.slice(1);
  setTimeout(() => {
    $('navList').querySelector('.n-btn')?.focus({ preventScroll: true });
    if (target === 'resumo') openSummary();
    else if (target && SYSTEMS.some((s) => s.id === target)) openSystem(target);
  }, state.galaxy ? 4200 : 0);
}

function listenScene() {
  addEventListener('galaxy:hover', (e) => highlightNav(e.detail.id));
  addEventListener('galaxy:select', (e) => openSystem(e.detail.id));
  addEventListener('galaxy:arrived', (e) => onArrived(e.detail.id));
  addEventListener('galaxy:planet', (e) => highlightTech(e.detail.i, e.detail.click));
}

async function startScene() {
  if (state.flatMode) { document.body.classList.remove('booting'); return; }
  try {
    const { initGalaxy } = await import('./scene/index.js');
    loader.done('engine');
    const m = state.manifest || {};
    state.galaxy = initGalaxy({
      canvas: $('space'),
      systems: SYSTEMS,
      techCounts: Object.fromEntries(SYSTEMS.map((S) => [S.id, S.id === 'incidentes' ? TEXT.pt.bosses.length : (TEXT.pt.layers[S.id].techs || []).length])),
      labelsHost: $('labels'),
      nebulaUrls: (m.nebula || []).map(assetUrl),
      homeTextures: m.planet ? Object.fromEntries(Object.entries(m.planet).map(([k, v]) => [k, assetUrl(v)])) : null,
      planetMaps: (m.planets || []).map((p) => ({ url: assetUrl(p.map), kind: p.kind })),
      onStep: (k) => loader.done(k)
    });
    document.body.classList.add('has-3d');
    /* celular sem memória de GPU pode perder o contexto WebGL: cai no modo lista em vez de tela preta */
    $('space').addEventListener('webglcontextlost', () => {
      state.flatMode = true;
      document.body.classList.add('flat-mode');
      document.body.classList.remove('booting');
      renderPage();
    }, { once: true });
    await state.galaxy.ready;
  } catch (err) {
    console.error(err);
    state.flatMode = true;
    document.body.classList.add('flat-mode');
    document.body.classList.remove('booting');
  }
}

/* todas as imagens 2D do manifesto (logo, retratos, derrotas, insígnias);
   as texturas da cena ficam com o carregamento da própria cena */
function imageUrls(m) {
  const out = [];
  const walk = (v, key) => {
    if (['planet', 'planets', 'nebula'].includes(key)) return;
    if (state.flatMode && ['logo', 'defeat'].includes(key)) return;   /* a página não usa */
    if (typeof v === 'string') { if (/\.(webp|png|jpe?g)$/i.test(v)) out.push(assetUrl(v)); }
    else if (Array.isArray(v)) v.forEach((x) => walk(x));
    else if (v && typeof v === 'object') for (const k in v) walk(v[k], k);
  };
  walk(m);
  return out;
}

const loader = createLoader(state.flatMode
  ? [['fonts', 1], ['data', 1], ['images', 3]]
  : [['fonts', 1], ['data', 1], ['images', 3], ['engine', 2], ['textures', 3], ['models', 3], ['shaders', 3]]);

initControls();
initMusic();
initNav();
initDossier();
initEasterEggs();
initCutscene();
loadCutscenes();
listenScene();
applyLang(state.lang);

/* carrega tudo antes de mostrar a abertura: fontes, dados, imagens, motor 3D,
   texturas, modelos e shaders compilados. Depois, em segundo plano, as
   cutscenes e a trilha. */
loader.track('fonts', document.fonts.ready);
Promise.all([
  loadManifest(),
  fetch('/models/manifest.json').then((r) => (r.ok ? r.json() : null)).catch(() => null)
]).then(async ([manifest, models]) => {
  if (models?.credits) state.credits = models.credits;
  if (manifest) state.manifest = manifest;
  loader.done('data');
  const images = loader.track('images', preloadImages(manifest ? imageUrls(manifest) : [], (f) => loader.progress('images', f)));
  await Promise.all([images, startScene()]);
  applyLang(state.lang);
  await loader.finish();
  if (state.flatMode) return;   /* versão em página: sem abertura animada, cutscenes ou trilha */
  if (manifest?.logo) playLogo($('logo'), manifest.logo, 'Roger Allan', reduce);
  preloadCutscenes().then(warmMusic);
});
