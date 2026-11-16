/* HTML do dossiê: técnicas, anomalias, origem, resumo técnico e o bloco de
   cada sistema. Funções puras sobre o estado; quem liga os eventos é o dossier.js. */
import { SYSTEMS, BOSS_CODE, STACK } from '../content/index.js';
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
  return `<div class="c-links">
      <a class="c-link" href="mailto:rogerallan4004@gmail.com">${esc(t.mail)}<small>rogerallan4004@gmail.com</small></a>
      <a class="c-link" href="https://wa.me/5547988731921?text=${encodeURIComponent(t.waMsg)}" target="_blank" rel="noopener">${esc(t.wa)}<small>+55 47 98873-1921</small></a>
    </div>`;
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
  return `<header class="d-head${id === 'incidentes' ? ' d-q' : ''}">
      ${ins ? `<img class="d-ins" src="${assetUrl(ins)}" alt="" width="512" height="512" decoding="async" />` : ''}
      <p class="d-code">${S.code}</p>
      <h2 class="d-name">${esc(tx.name)}</h2>
      <p class="d-sub">${esc(tx.sub)}</p>
    </header>
    ${tx.intro ? `<p class="d-intro">${esc(tx.intro)}</p>` : ''}
    ${body}
    ${arsenal}`;
}
