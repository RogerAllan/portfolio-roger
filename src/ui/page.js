/* Versão em página, a entrada do site: o portfólio como um centro de
   comando. Radar das áreas, telemetria, tela principal de trabalhos, painéis de
   engenharia e registro de incidentes. A interação fica em console.js. */
import { SYSTEMS, BOSS_CODE, STACK, WORKS, worksFor, CAREER, EDUCATION } from '../content/index.js';
import { state, T, $, esc } from './state.js';
import { assetUrl } from '../fx/logo-frames.js';
import { contactLinks } from './templates.js';
import { initConsole } from './console.js';
import { initPageMotion } from './motion.js';
import { mountMiniGalaxy } from './mini-galaxy.js';
import { initStatus } from './status.js';

const AREAS = SYSTEMS.filter((S) => !['incidentes', 'sobre'].includes(S.id));
const hex = (c) => `#${c.toString(16).padStart(6, '0')}`;
const insignia = (id) => state.manifest?.insignia?.[id];
const counted = (n, [one, many]) => `${n} ${n === 1 ? one : many}`;
const chips = (list) => (list?.length ? `<p class="cc-chips">${list.map((x) => `<span>${esc(x)}</span>`).join('')}</p>` : '');

const head = (code, id, title, lede = '', meta = '') => `<header class="cc-head">
    <p class="cc-code">${code}</p>
    <h2 class="cc-h" id="h-${id}">${esc(title)}</h2>
    ${lede ? `<p class="cc-lede">${esc(lede)}</p>` : ''}
    ${meta ? `<p class="cc-meta">${esc(meta)}</p>` : ''}
  </header>`;
const SECTION_CODES = { trabalhos: 'WK-00', trajetoria: 'XP-00', resumo: 'CV-00', engenharia: 'SY-07', incidentes: 'IR-00', tema: 'TM-00', sobre: 'ME-00' };

/* radar: as áreas nas mesmas posições que ocupam na carta estelar 3D */
function radar() {
  const t = T();
  const SCALE = 0.84;
  const spokes = AREAS.map((S) => `<line x1="0" y1="0" x2="${(S.pos[0] * SCALE * 2).toFixed(1)}" y2="${(S.pos[1] * SCALE * 2).toFixed(1)}" />`).join('');
  const nodes = AREAS.map((S, i) => {
    const [x, z] = S.pos;
    const side = x > 28 || (x < 0 && x > -30) ? ' is-l' : '';
    const angle = (Math.atan2(x, -z) * 180 / Math.PI + 360) % 360;
    return `<button type="button" class="cc-node${side}" data-area="${S.id}" aria-pressed="false"
      style="--x:${50 + x * SCALE}%;--y:${50 + z * SCALE}%;--c:${hex(S.star)};--a:${(angle / 45).toFixed(2)}s;--i:${i}">
      <i aria-hidden="true"></i><span>${esc(t.layers[S.id].name)}</span></button>`;
  }).join('');
  return `<div class="cc-radar">
      <div class="cc-scope">
        <svg viewBox="-100 -100 200 200" aria-hidden="true">
          <circle r="98" /><circle r="66" /><circle r="33" />
          <line class="cc-axis" x1="-98" x2="98" y1="0" y2="0" /><line class="cc-axis" y1="-98" y2="98" x1="0" x2="0" />
          <g class="cc-spokes">${spokes}</g>
        </svg>
        <span class="cc-sweep" aria-hidden="true"></span>
        ${nodes}
        <a class="cc-core" href="#sec-incidentes"><i aria-hidden="true"></i><span>${esc(t.layers.incidentes.name)}</span></a>
      </div>
      <div class="cc-readout" id="ccReadout" aria-live="polite"></div>
    </div>`;
}

/* painel de sistemas da ponte: cada linha leva à seção da área */
function board() {
  const t = T();
  const n = t.bosses.length;
  return `<div class="cc-board cc-plate">
      <h2 class="cc-btitle">${esc(t.ui.systems)}</h2>
      <div class="cc-sysl">${AREAS.map((S) => `<button type="button" class="cc-sysrow" data-area="${S.id}" aria-pressed="false" style="--c:${hex(S.star)}">
        <i aria-hidden="true"></i><span>${esc(t.layers[S.id].name)}</span><small>${counted(t.layers[S.id].techs.length, t.ui.techWord)}</small>
        <b class="cc-ticks" style="--n:${t.layers[S.id].techs.length}" aria-hidden="true"></b>
      </button>`).join('')}</div>
      <a class="cc-sysinc" href="#sec-incidentes"><i aria-hidden="true"></i><span>${esc(t.layers.incidentes.name)}</span><small>${esc(t.ui.metaInc.replaceAll('{n}', n))}</small></a>
    </div>`;
}

function hero() {
  const t = T().ui;
  return `<header class="cc-hero" id="sec-top">
      <div class="cc-id cc-plate">
        <p class="cc-status"><i aria-hidden="true"></i>${esc(t.available)}</p>
        <h1 class="cc-name"><img class="cc-logo" src="/assets/logo-name.webp" alt="Roger Allan" width="960" height="188" decoding="async" /><span class="cc-nametxt" aria-hidden="true">Roger Allan</span></h1>
        <div class="cc-idtop">
          <div class="cc-idtxt">
            <p class="cc-role">${esc(t.headline)}</p>
            <p class="cc-place">${esc(t.location)}</p>
          </div>
          <figure class="cc-photo"><img src="/assets/roger-card.webp" alt="" width="360" height="480" decoding="async" /></figure>
        </div>
        <p class="cc-lead">${esc(t.profile)}</p>
        <div class="cc-cta">${contactLinks()}</div>
      </div>
      <div class="cc-view cc-plate">
        <h2 class="cc-btitle">${esc(t.mapH)}</h2>
        ${radar()}
      </div>
      ${board()}
    </header>
    <dl class="cc-kpis">${t.kpis.map(([v, l]) => `<div><dt>${esc(l)}</dt><dd data-count="${esc(v)}">${esc(v)}</dd></div>`).join('')}</dl>`;
}

function jump() {
  const t = T().ui;
  return `<nav class="cc-jump" aria-label="${esc(t.pageToc)}">${Object.entries(t.jump).map(([id, name]) => `<a href="#sec-${id}" data-sec="${id}" data-name="${esc(name)}"><span class="cc-jcode" aria-hidden="true">${SECTION_CODES[id]}</span>${esc(name)}</a>`).join('')}</nav>`;
}

/* barra de status */
function dock() {
  const t = T().ui;
  return `<div class="cc-dock">
      <p class="cc-dstat"><span id="ccSector">${esc(t.dockBridge)}</span><span id="ccProg">0%</span><span id="ccClock"></span></p>
    </div>`;
}

function theme() {
  const t = T().ui;
  return `<section class="cc-sec" id="sec-tema" aria-labelledby="h-tema">
      ${head('TM-00', 'tema', t.themeH, t.themeLede)}
      <div class="cc-theme">
        <div class="cc-plate cc-pad cc-why">${t.themeWhy.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        <div class="cc-plate cc-pad">
          <h3 class="cc-sub">${esc(t.themeReadH)}</h3>
          <dl class="cc-legend">${t.themeRead.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </div>
      </div>
    </section>`;
}

function tabs() {
  const t = T();
  return `<div class="cc-tabs" role="group" aria-label="${esc(t.ui.areasLabel)}">
      <button type="button" class="cc-tab" data-area="all" aria-pressed="true"><i aria-hidden="true"></i>${esc(t.ui.allAreas)}</button>
      ${AREAS.map((S) => `<button type="button" class="cc-tab" data-area="${S.id}" aria-pressed="false" style="--c:${hex(S.star)}"><i aria-hidden="true"></i>${esc(t.layers[S.id].name)}</button>`).join('')}
    </div>`;
}

function work(w) {
  const ui = T().ui;
  const [kind, desc, metrics] = w.t[state.lang];
  const src = `/assets/works/${w.img}.webp`;
  return `<article class="cc-work" id="work-${w.id}" data-work="${w.id}">
      ${w.img
    ? `<button type="button" class="cc-shot" data-zoom="${src}" aria-label="${esc(ui.worksZoom.replace('{n}', w.name))}"><img src="${src}" alt="" width="1440" height="900" loading="lazy" decoding="async" /></button>`
    : `<div class="cc-noshot" aria-hidden="true"><span>${esc(w.name)}</span></div>`}
      <div class="cc-work-body">
        <p class="cc-kind">${esc(kind)}</p>
        <h3 class="cc-wname">${esc(w.name)}</h3>
        <p class="cc-desc">${esc(desc)}</p>
        ${metrics ? `<dl class="cc-metrics">${metrics.map(([v, l]) => `<div><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        ${chips(w.stack)}
        ${w.url ? `<a class="cc-link" href="${esc(w.url)}" target="_blank" rel="noopener">${esc(ui.worksVisit)}</a>` : ''}
      </div>
    </article>`;
}

function works() {
  const t = T().ui;
  return `<section class="cc-sec" id="sec-trabalhos" aria-labelledby="h-trabalhos">
      ${head('WK-00', 'trabalhos', t.worksH, t.worksIntro, t.metaWorks.replace('{n}', WORKS.length))}
      ${tabs()}
      <div class="cc-deck cc-plate">
        <div class="cc-screen">${WORKS.map(work).join('')}</div>
        <ol class="cc-roster">${WORKS.map((w) => `<li data-roster="${w.id}"><button type="button" class="cc-rbtn" data-pick="${w.id}" aria-pressed="false">
          ${w.img ? `<img class="cc-rthumb" src="/assets/works/${w.img}.webp" alt="" width="72" height="45" loading="lazy" decoding="async" />` : '<span class="cc-rthumb is-empty" aria-hidden="true"></span>'}
          <span class="cc-rname">${esc(w.name)}</span><span class="cc-rkind">${esc(w.t[state.lang][0])}</span></button></li>`).join('')}</ol>
      </div>
    </section>`;
}

function career() {
  const t = T().ui;
  return `<section class="cc-sec" id="sec-trajetoria" aria-labelledby="h-trajetoria">
      ${head('XP-00', 'trajetoria', t.careerH, '', t.metaJobs.replace('{n}', CAREER.length))}
      <div class="cc-career">
        <ol class="cc-route cc-plate">${CAREER.map((c) => {
    const [role, period, desc] = c.t[state.lang];
    return `<li class="cc-stop${c.now ? ' is-now' : ''}">
          <p class="cc-period">${esc(period)}${c.now ? `<span><i aria-hidden="true"></i>${esc(t.careerNow)}</span>` : ''}</p>
          <div>
            <h3 class="cc-jobt">${esc(role)}</h3>
            <p class="cc-org">${esc(c.org)}</p>
            <p class="cc-jobd">${esc(desc)}</p>
            ${chips(c.stack)}
          </div>
        </li>`;
  }).join('')}</ol>
        <div class="cc-plate cc-pad cc-edu">
          <h3 class="cc-sub">${esc(t.educationH)}</h3>
          <dl>${EDUCATION[state.lang].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </div>
      </div>
    </section>`;
}

function summary() {
  const t = T().ui;
  return `<section class="cc-sec" id="sec-resumo" aria-labelledby="h-resumo">
      ${head('CV-00', 'resumo', t.summaryH)}
      <div class="cc-brief">
        <div class="cc-plate cc-pad">
          <h3 class="cc-sub">${esc(t.highlightsH)}</h3>
          <ul class="cc-list">${t.highlights.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <div class="cc-plate cc-pad">
          <h3 class="cc-sub">${esc(t.stackH)}</h3>
          <dl class="cc-stack">${STACK.map(([k, items]) => `<div><dt>${esc(t.stackLabels[k])}</dt><dd>${items.map(esc).join(', ')}</dd></div>`).join('')}</dl>
        </div>
      </div>
    </section>`;
}

function panel(S) {
  const t = T();
  const tx = t.layers[S.id];
  const related = worksFor(S.id);
  const ins = insignia(S.id);
  return `<article class="cc-panel cc-plate cc-pad" data-panel="${S.id}" tabindex="-1" style="--c:${hex(S.star)}">
      <header class="cc-phead">
        ${ins ? `<img src="${assetUrl(ins)}" alt="" width="72" height="72" loading="lazy" decoding="async" />` : ''}
        <div><p class="cc-code">${S.code}</p><h3 class="cc-pname">${esc(tx.name)}</h3><p class="cc-psub">${esc(tx.sub)}</p></div>
      </header>
      <p class="cc-pintro">${esc(tx.intro)}</p>
      <div class="cc-techs">${tx.techs.map((e, i) => `<details class="cc-tech">
        <summary><b>${esc(e.t)}</b><span>${esc(e.p)}</span></summary>
        <div class="cc-tbody"><p><strong>${esc(t.ui.how)}.</strong> ${esc(e.h)}</p>${chips(S.tags?.[i])}</div>
      </details>`).join('')}</div>
      ${related.length ? `<p class="cc-related"><strong>${esc(t.ui.worksArea)}</strong>${related.map((w) => `<button type="button" data-show="${w.id}">${esc(w.name)}</button>`).join('')}</p>` : ''}
      <p class="cc-arsenal"><strong>${esc(t.ui.arsenal)}.</strong> ${S.stack.map(esc).join(', ')}</p>
    </article>`;
}

function engineering() {
  const t = T();
  return `<section class="cc-sec" id="sec-engenharia" aria-labelledby="h-engenharia">
      ${head('SY-07', 'engenharia', t.ui.engH, t.ui.engIntro, t.ui.metaEng.replace('{n}', AREAS.length).replace('{t}', AREAS.reduce((s, S) => s + t.layers[S.id].techs.length, 0)))}
      ${tabs()}
      <div class="cc-grid" data-overview>${AREAS.map((S) => {
    const ins = insignia(S.id), tx = t.layers[S.id];
    return `<button type="button" class="cc-acard" data-area="${S.id}" aria-pressed="false" style="--c:${hex(S.star)}">
          ${ins ? `<img src="${assetUrl(ins)}" alt="" width="48" height="48" loading="lazy" decoding="async" />` : ''}
          <span class="cc-aname">${esc(tx.name)}</span>
          <span class="cc-asub">${esc(tx.sub)}</span>
          <b class="cc-ticks" style="--n:${tx.techs.length}" aria-hidden="true"></b>
          <span class="cc-acount">${counted(tx.techs.length, t.ui.techWord)}, ${counted(worksFor(S.id).length, t.ui.workWord)}</span>
        </button>`;
  }).join('')}</div>
      ${AREAS.map(panel).join('')}
    </section>`;
}

function incidents() {
  const t = T();
  return `<section class="cc-sec" id="sec-incidentes" aria-labelledby="h-incidentes">
      ${head('IR-00', 'incidentes', t.layers.incidentes.name, t.ui.incidentsIntro, t.ui.metaInc.replaceAll('{n}', t.bosses.length))}
      <div class="cc-log cc-plate">${t.bosses.map((b, i) => {
    const art = state.manifest?.anomaly?.[i];
    return `<details class="cc-inc"${i === 0 ? ' open' : ''}>
        <summary>
          <span class="cc-icode">IR-${String(i + 1).padStart(2, '0')}</span>
          <b>${esc(b.name)}</b>
          <span class="cc-iok"><i aria-hidden="true"></i>${esc(t.ui.defeated)}</span>
        </summary>
        <div class="cc-ibody">
          ${art ? `<img src="${assetUrl(art)}" alt="" width="768" height="1024" loading="lazy" decoding="async" />` : ''}
          <div>
            <dl class="cc-phases">${[b.s, b.c, b.f].map((p, j) => `<div><dt>${esc(t.ui.phases[j])}</dt><dd>${esc(p)}</dd></div>`).join('')}</dl>
            <pre class="cc-pre"><code>${esc(BOSS_CODE[i])}</code></pre>
          </div>
        </div>
      </details>`;
  }).join('')}</div>
    </section>`;
}

function about() {
  const t = T().ui;
  const ship = state.credits.find((c) => /spaceship/i.test(c.name));
  return `<section class="cc-sec" id="sec-sobre" aria-labelledby="h-sobre">
      ${head('ME-00', 'sobre', T().layers.sobre.name)}
      <div class="cc-about cc-plate">
        <img src="/assets/roger.jpg" alt="Roger Allan" width="1708" height="2560" loading="lazy" decoding="async" />
        <div class="cc-abody">
          ${t.about.map((p) => `<p>${esc(p)}</p>`).join('')}
          <h3 class="cc-sub">${esc(t.contactH)}</h3>
          <p>${esc(t.contactP)}</p>
          <div class="cc-cta">${contactLinks()}</div>
        </div>
      </div>
      <footer class="cc-foot">© ${new Date().getFullYear()} Roger Allan. ${esc(t.foot)}
        ${ship ? `<br />${esc(t.credits)} <a href="${esc(ship.url)}" target="_blank" rel="noopener">${esc(ship.name)}</a>, ${esc(ship.author)}.` : ''}</footer>
    </section>`;
}

export function renderPage() {
  const root = $('flat');
  const y = scrollY;
  root.hidden = false;
  root.innerHTML = `${hero()}${jump()}${works()}${career()}${summary()}${engineering()}${incidents()}${theme()}${about()}${dock()}`;
  if (y > 0) scrollTo({ top: y, behavior: 'instant' });   /* troca de idioma mantém a posição */
  initConsole(root);
  initStatus(root);
  initPageMotion(root);
  mountMiniGalaxy(root);
}
