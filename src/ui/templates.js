/* HTML do dossiê: técnicas, anomalias, origem, resumo técnico e o bloco de
   cada sistema. Funções puras sobre o estado; quem liga os eventos é o dossier.js. */
import { SYSTEMS, BOSS_CODE, STACK, WORKS, worksFor, CV_FILES, LINKS } from '../content/index.js';
import { state, T, esc } from './state.js';
import { assetUrl } from '../fx/logo-frames.js';
import { finalFrame } from './defeat.js';

const systemOf = (id) => SYSTEMS.find((s) => s.id === id);

function techList(id) {
  const tx = T().layers[id];
  if (!tx.techs) return '';
  const tags = systemOf(id).tags || [];
  return '<ol class="grim">' + tx.techs.map((e, i) => {
    const eid = `e-${id}-${i}`;
    const tg = (tags[i] || []).map((x) => `<span>${esc(x)}</span>`).join('');
    return `<li class="entry" data-i="${i}">
      <button type="button" class="e-btn" aria-expanded="false" aria-controls="${eid}">
        <span class="e-orb" aria-hidden="true"></span>
        <span class="e-t">${esc(e.t)}</span>
        <span class="e-p">${esc(e.p)}</span>
        ${tg ? `<span class="e-tags">${tg}</span>` : ''}
      </button>
      <div class="e-how" id="${eid}" hidden><p><span class="e-k">${T().ui.how}.</span> ${esc(e.h)}</p></div>
    </li>`;
  }).join('') + '</ol>';
}

function anomalies() {
  const t = T();
  return `<p class="b-count" data-count></p><div class="bosses">` + t.bosses.map((b, i) => {
    const h = state.bossHits[i];
    const label = h === 0 ? t.ui.strike : h === 1 ? t.ui.strikeAgain : t.ui.finish;
    const art = state.manifest?.anomaly?.[i];
    const done = h >= 3 ? finalFrame(i) : null;
    return `<article class="boss${h >= 3 ? ' dead' : ''}${art ? ' has-art' : ''}${done ? ' animated' : ''}" data-b="${i}">
      ${art ? `<img class="b-portrait" src="${done || assetUrl(art)}" alt="" width="768" height="1024" loading="lazy" decoding="async" />` : ''}
      <h3 class="b-name">${esc(b.name)}</h3>
      <div class="b-hp" role="progressbar" aria-label="${t.ui.hp}" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${3 - h}"><span class="b-hp-fill" style="--hp:${(3 - h) / 3}"></span></div>
      <ol class="b-phases">${[b.s, b.c, b.f].map((p, j) => `<li${j < h ? '' : ' hidden'}><span class="b-k">${t.ui.phases[j]}</span><p>${esc(p)}</p></li>`).join('')}</ol>
      <code class="b-code"${h >= 3 ? '' : ' hidden'}>${esc(BOSS_CODE[i])}</code>
      <button type="button" class="b-strike"${h >= 3 ? ' hidden' : ''}>${label}</button>
      <span class="b-stamp"${h >= 3 ? '' : ' hidden'}>${t.ui.defeated}</span>
    </article>`;
  }).join('') + '</div>';
}

export function contactLinks() {
  const t = T().ui;
  const cv = CV_FILES[state.lang];
  const ico = (d) => `<svg class="c-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" /></svg>`;
  return `<div class="c-links">
      <a class="c-link c-cv" href="${cv.href}" download="${cv.name}">${ico('M12 3v12 M7 10.5l5 5 5-5 M4 20.5h16')}<span class="c-lab">${esc(t.cvDownload)}<small>${esc(t.cvMeta)}</small></span></a>
      <a class="c-link" href="mailto:rogerallan4004@gmail.com">${ico('M3 6h18v12H3z M3 7l9 7 9-7')}<span class="c-lab">${esc(t.mail)}<small>rogerallan4004@gmail.com</small></span></a>
      <a class="c-link" href="https://wa.me/5547988731921?text=${encodeURIComponent(t.waMsg)}" target="_blank" rel="noopener">${ico('M4 20l1.4-4.2A8 8 0 1 1 8.4 19z M9 9.5c0 3 2.5 5.5 5.5 5.5')}<span class="c-lab">${esc(t.wa)}<small>+55 47 98873-1921</small></span></a>
    </div>
    <p class="c-social"><a href="${LINKS.linkedin}" target="_blank" rel="noopener">${ico('M4 4h16v16H4z M8 10.5V17 M8 7.2v.1 M12 17v-6.5 M12 13.5c0-3.6 5-3.6 5 0V17')}LinkedIn</a><a href="${LINKS.github}" target="_blank" rel="noopener">${ico('M7 4v16 M7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M17 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M17 10c0 4-10 2-10 6')}GitHub</a></p>`;
}

/* card de um trabalho: com print (ampliável) ou só texto */
function workCard(w) {
  const ui = T().ui;
  const [kind, desc, metrics] = w.t[state.lang];
  const src = w.img ? `/assets/works/${w.img}.webp` : '';
  return `<article class="wk${w.img ? '' : ' no-shot'}" id="work-${w.id}">
      ${w.img ? `<button type="button" class="wk-shot" data-zoom="${src}" aria-label="${esc(ui.worksZoom.replace('{n}', w.name))}">
        <span class="wk-frame"><img src="${src}" alt="" width="1440" height="900" loading="lazy" decoding="async" /></span>
      </button>` : ''}
      <div class="wk-body">
        <p class="wk-kind">${esc(kind)}</p>
        <h3 class="wk-name">${esc(w.name)}</h3>
        <p class="wk-desc">${esc(desc)}</p>
        ${metrics ? `<dl class="wk-metrics">${metrics.map(([v, l]) => `<div><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        <p class="wk-stack">${w.stack.map((x) => `<span>${esc(x)}</span>`).join('')}</p>
        ${w.url ? `<a class="wk-link" href="${esc(w.url)}" target="_blank" rel="noopener">${esc(ui.worksVisit)}</a>` : ''}
      </div>
    </article>`;
}

/* lista de trabalhos: primeiro os que têm print, depois os só de texto */
export function worksList(list = WORKS) {
  const shots = list.filter((w) => w.img), rest = list.filter((w) => !w.img);
  return `${shots.length ? `<div class="wk-list">${shots.map(workCard).join('')}</div>` : ''}
    ${rest.length ? `<div class="wk-more">${rest.map(workCard).join('')}</div>` : ''}`;
}

export function worksPanel() {
  const t = T().ui;
  return `<header class="d-head">
      <p class="d-code">WK-00</p>
      <h2 class="d-name">${esc(t.worksH)}</h2>
      <p class="d-sub">${esc(t.worksSub)}</p>
    </header>
    <p class="d-intro">${esc(t.worksIntro)}</p>
    ${worksList()}`;
}

function origin() {
  const t = T().ui;
  const credits = state.credits.length
    ? `<div class="credits"><p>${t.credits}</p><ul>${state.credits.map((c) => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.name)}</a>, ${esc(c.author)}</li>`).join('')}</ul></div>`
    : '';
  return `<figure class="portrait"><img src="/assets/roger.jpg" alt="Roger Allan" width="1708" height="2560" loading="lazy" /></figure>
    ${t.about.map((p) => `<p>${esc(p)}</p>`).join('')}
    <h3 class="o-h">${esc(t.contactH)}</h3>
    <p>${esc(t.contactP)}</p>
    ${contactLinks()}
    ${credits}
    <p class="foot">© ${new Date().getFullYear()} Roger Allan. ${esc(t.foot)}</p>`;
}

export function summaryBlock() {
  const t = T().ui;
  return `<header class="d-head">
      <p class="d-code">CV-00</p>
      <h2 class="d-name">${esc(t.summaryH)}</h2>
      <p class="d-sub">${esc(t.summarySub)}</p>
    </header>
    <p class="d-intro s-profile">${esc(t.profile)}</p>
    <h3 class="s-h">${esc(t.highlightsH)}</h3>
    <ul class="s-list">${t.highlights.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h3 class="s-h">${esc(t.stackH)}</h3>
    <dl class="s-stack">${STACK.map(([k, items]) => `<dt>${esc(t.stackLabels[k])}</dt><dd>${items.map(esc).join(', ')}</dd>`).join('')}</dl>
    <h3 class="s-h">${esc(t.contactH)}</h3>
    <p>${esc(t.contactP)}</p>
    ${contactLinks()}
    ${state.flatMode ? '' : `<button type="button" class="engage s-explore" data-explore><span>${esc(t.explore)}</span></button>`}`;
}

export function systemBlock(id) {
  const S = systemOf(id);
  const tx = T().layers[id];
  const ins = state.manifest?.insignia?.[id];
  const body = id === 'incidentes' ? anomalies() : id === 'sobre' ? origin() : techList(id);
  const arsenal = S.stack ? `<p class="arsenal"><span class="ar-k">${T().ui.arsenal}</span> ${S.stack.map(esc).join(', ')}</p>` : '';
  const related = worksFor(id);
  return `<header class="d-head${id === 'incidentes' ? ' d-q' : ''}">
      ${ins ? `<img class="d-ins" src="${assetUrl(ins)}" alt="" width="512" height="512" decoding="async" />` : ''}
      <p class="d-code">${S.code}</p>
      <h2 class="d-name">${esc(tx.name)}</h2>
      <p class="d-sub">${esc(tx.sub)}</p>
    </header>
    ${tx.intro ? `<p class="d-intro">${esc(tx.intro)}</p>` : ''}
    ${body}
    ${related.length ? `<h3 class="s-h">${esc(T().ui.worksArea)}</h3>${worksList(related)}` : ''}
    ${arsenal}`;
}
