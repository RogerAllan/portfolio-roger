/* Versão em página (?view=page, ou sem WebGL): o portfólio inteiro como uma
   página de leitura tradicional, sem 3D nem gamificação. Tudo aberto: técnicas
   com problema e implementação, incidentes com sintoma, causa-raiz e correção.
   Os ids das seções (sec-<sistema>) são os mesmos que a navegação usa. */
import { SYSTEMS, BOSS_CODE, STACK } from '../content/index.js';
import { state, T, $, esc } from './state.js';
import { assetUrl } from '../fx/logo-frames.js';
import { contactLinks } from './templates.js';

const tags = (list) => (list?.length ? `<p class="pg-tags">${list.map((x) => `<span>${esc(x)}</span>`).join('')}</p>` : '');

function hero() {
  const t = T().ui;
  return `<header class="pg-hero" id="sec-top">
      <h1 class="pg-name">Roger Allan</h1>
      <p class="pg-role">${esc(t.role)}</p>
      <p class="pg-lead">${esc(t.pageLead)}</p>
      <p class="pg-stats">${t.surface}</p>
      ${contactLinks()}
    </header>`;
}

function summary() {
  const t = T().ui;
  return `<section class="pg-sec" id="sec-resumo" aria-labelledby="h-resumo">
      <p class="pg-code">CV-00</p>
      <h2 class="pg-h" id="h-resumo">${esc(t.summaryH)}</h2>
      <p class="pg-intro">${esc(t.profile)}</p>
      <h3 class="pg-sub">${esc(t.highlightsH)}</h3>
      <ul class="pg-list">${t.highlights.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <h3 class="pg-sub">${esc(t.stackH)}</h3>
      <dl class="pg-stack">${STACK.map(([k, items]) => `<dt>${esc(t.stackLabels[k])}</dt><dd>${items.map(esc).join(', ')}</dd>`).join('')}</dl>
    </section>`;
}

function techniques(S) {
  const tx = T().layers[S.id], t = T().ui;
  return `<ol class="pg-techs">${(tx.techs || []).map((e, i) => `<li class="pg-tech">
      <h3 class="pg-tt">${esc(e.t)}</h3>
      <p><span class="pg-k">${esc(t.problem)}.</span> ${esc(e.p)}</p>
      <p><span class="pg-k">${esc(t.how)}.</span> ${esc(e.h)}</p>
      ${tags(S.tags?.[i])}
    </li>`).join('')}</ol>`;
}

function incidents() {
  const t = T();
  return `<div class="pg-incs">${t.bosses.map((b, i) => {
    const art = state.manifest?.anomaly?.[i];
    return `<article class="pg-inc">
      ${art ? `<img class="pg-inc-art" src="${assetUrl(art)}" alt="" width="768" height="1024" loading="lazy" decoding="async" />` : ''}
      <div class="pg-inc-body">
        <p class="pg-code">${esc(t.ui.incidentsH)} ${String(i + 1).padStart(2, '0')}</p>
        <h3 class="pg-tt">${esc(b.name)}</h3>
        <dl class="pg-phases">${[b.s, b.c, b.f].map((p, j) => `<dt>${esc(t.ui.phases[j])}</dt><dd>${esc(p)}</dd>`).join('')}</dl>
        <pre class="pg-pre"><code>${esc(BOSS_CODE[i])}</code></pre>
      </div>
    </article>`;
  }).join('')}</div>`;
}

function about() {
  const t = T().ui;
  return `<div class="pg-about">
      <img class="pg-portrait" src="/assets/roger.jpg" alt="Roger Allan" width="1708" height="2560" loading="lazy" decoding="async" />
      <div>${t.about.map((p) => `<p>${esc(p)}</p>`).join('')}
        <h3 class="pg-sub">${esc(t.contactH)}</h3>
        <p>${esc(t.contactP)}</p>
        ${contactLinks()}
      </div>
    </div>`;
}

function system(S) {
  const tx = T().layers[S.id];
  const body = S.id === 'incidentes' ? incidents() : S.id === 'sobre' ? about() : techniques(S);
  const arsenal = S.stack ? `<p class="pg-arsenal"><span class="pg-k">${esc(T().ui.arsenal)}.</span> ${S.stack.map(esc).join(', ')}</p>` : '';
  return `<section class="pg-sec${S.id === 'incidentes' ? ' pg-q' : ''}" id="sec-${S.id}" aria-labelledby="h-${S.id}">
      <p class="pg-code">${S.code}</p>
      <h2 class="pg-h" id="h-${S.id}">${esc(tx.name)}</h2>
      <p class="pg-subtitle">${esc(tx.sub)}</p>
      ${S.id === 'incidentes' ? `<p class="pg-intro">${esc(T().ui.incidentsIntro)}</p>` : tx.intro ? `<p class="pg-intro">${esc(tx.intro)}</p>` : ''}
      ${body}
      ${arsenal}
    </section>`;
}

function toc() {
  const t = T();
  const items = [['resumo', 'CV-00', t.ui.summaryH], ...SYSTEMS.map((S) => [S.id, S.code, t.layers[S.id].name])];
  return `<nav class="pg-toc" aria-label="${esc(t.ui.pageToc)}">
      <p class="pg-toc-h">${esc(t.ui.pageToc)}</p>
      <ol>${items.map(([id, code, name]) => `<li><a href="#sec-${id}" data-sec="${id}"><span>${code}</span>${esc(name)}</a></li>`).join('')}</ol>
    </nav>`;
}

/* destaca no índice a seção que está na tela */
let spy = null;
function watchSections(root) {
  spy?.disconnect();
  const links = new Map([...root.querySelectorAll('.pg-toc a')].map((a) => [a.dataset.sec, a]));
  spy = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      links.forEach((a) => a.removeAttribute('aria-current'));
      links.get(e.target.id.slice(4))?.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-35% 0px -60% 0px' });
  root.querySelectorAll('.pg-sec').forEach((s) => spy.observe(s));
}

export function renderPage() {
  const root = $('flat');
  const y = scrollY;
  root.hidden = false;
  root.innerHTML = `${hero()}
    <div class="pg-grid">
      ${toc()}
      <div class="pg-main">
        ${summary()}
        ${SYSTEMS.map(system).join('')}
        <footer class="pg-foot">© ${new Date().getFullYear()} Roger Allan. ${esc(T().ui.foot)}</footer>
      </div>
    </div>`;
  if (y > 0) scrollTo({ top: y, behavior: 'instant' });   /* troca de idioma mantém a posição */
  watchSections(root);
}
