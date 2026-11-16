/* Efeitos sonoros sintetizados com Web Audio, afinados com a trilha de fundo
   (ré sustenido menor, andamento lento, timbre escuro). Nada distorcido:
   senoides e triângulos suaves, filtro passa-baixa e um reverb compartilhado
   para que os efeitos pareçam vir do mesmo espaço da música.
   - tick: nota curta de vidro, sorteada da pentatônica da tonalidade
   - hit: baque grave abafado com ressonância metálica curta
   - warp: sopro filtrado que cresce e some, com grave descendo uma oitava
   - collapse: acorde menor que incha e afunda, com faíscas se dispersando
   Desligado por padrão; só existe AudioContext depois do clique do usuário. */

const NOTE = (midi) => 440 * 2 ** ((midi - 69) / 12);
const ROOT = 51;                         /* D#3 */
const PENTA = [0, 3, 5, 7, 10];           /* pentatônica menor */
const pentaNote = (oct) => NOTE(ROOT + 12 * oct + PENTA[Math.floor(Math.random() * PENTA.length)]);

let ctx = null, dry = null, wet = null;
let on = false;

function impulse(seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
  }
  return buf;
}

function boot() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.01;
  const master = ctx.createGain(); master.gain.value = 0.5;
  const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 5200;
  master.connect(tone).connect(comp).connect(ctx.destination);

  dry = ctx.createGain(); dry.gain.value = 0.8; dry.connect(master);
  const verb = ctx.createConvolver(); verb.buffer = impulse(3.2, 2.6);
  wet = ctx.createGain(); wet.gain.value = 0.55;
  wet.connect(verb).connect(master);
}

export function isOn() { return on; }

export function setSound(v) {
  on = v;
  if (on && !ctx) boot();
  if (!ctx) return;
  if (on) ctx.resume();
  else setTimeout(() => { if (!on) ctx.suspend(); }, 1500);
}

/* envia um nó para o mix seco e para o reverb */
function out(node, send = 0.5) {
  node.connect(dry);
  const s = ctx.createGain(); s.gain.value = send;
  node.connect(s).connect(wet);
}

/* nota com envelope: ataque suave, decaimento exponencial */
function voice(t, freq, { type = 'sine', amp = 0.1, attack = 0.005, decay = 0.4, send = 0.5, detune = 0 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq; o.detune.value = detune;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(amp, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  o.connect(g); out(g, send);
  o.start(t); o.stop(t + attack + decay + 0.05);
}

function noiseBuffer(len) {
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

let lastTick = 0;
export function tick() {
  if (!ctx || !on) return;
  const t = ctx.currentTime;
  if (t - lastTick < 0.07) return;       /* passar o mouse rápido não vira metralhadora */
  lastTick = t;
  voice(t, pentaNote(2), { type: 'triangle', amp: 0.035, decay: 0.35, send: 0.7 });
}

export function hit() {
  if (!ctx || !on) return;
  const t = ctx.currentTime + 0.01;
  /* baque: senoide grave caindo até a tônica */
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(NOTE(ROOT - 24), t + 0.18);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.32, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  o.connect(g); out(g, 0.25);
  o.start(t); o.stop(t + 0.55);
  /* ressonância de casco: tônica e quinta, bem baixas no mix */
  voice(t, NOTE(ROOT + 12), { amp: 0.045, decay: 0.9, send: 0.8 });
  voice(t, NOTE(ROOT + 19), { amp: 0.025, decay: 0.7, send: 0.8, detune: 4 });
}

/* salto de dobra: sopro filtrado que cresce e some + grave descendo */
export function warp() {
  if (!ctx || !on) return;
  const t = ctx.currentTime, len = 2.2;
  const s = ctx.createBufferSource(); s.buffer = noiseBuffer(len);
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 1.2;
  f.frequency.setValueAtTime(260, t);
  f.frequency.exponentialRampToValueAtTime(1800, t + len * 0.45);
  f.frequency.exponentialRampToValueAtTime(180, t + len);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.11, t + len * 0.45);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  s.connect(f).connect(g); out(g, 0.6);
  s.start(t);

  const o = ctx.createOscillator(), og = ctx.createGain();
  o.frequency.setValueAtTime(NOTE(ROOT - 12), t);
  o.frequency.exponentialRampToValueAtTime(NOTE(ROOT - 24), t + len);
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(0.16, t + 0.4);
  og.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(og); out(og, 0.3);
  o.start(t); o.stop(t + len + 0.05);
}

/* golpe final: acorde de ré sustenido menor que incha, afunda meio tom
   e se desfaz em faíscas da pentatônica (as brasas da cutscene) */
export function collapse() {
  if (!ctx || !on) return;
  const t = ctx.currentTime + 0.02, len = 4.2;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.7;
  lp.frequency.setValueAtTime(300, t);
  lp.frequency.exponentialRampToValueAtTime(1400, t + 0.9);
  lp.frequency.exponentialRampToValueAtTime(140, t + len);
  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.0001, t);
  bus.gain.exponentialRampToValueAtTime(0.2, t + 0.9);
  bus.gain.exponentialRampToValueAtTime(0.0001, t + len);
  lp.connect(bus); out(bus, 0.7);

  [-12, 0, 7, 12, 15].forEach((iv, k) => {
    [-6, 6].forEach((det) => {
      const o = ctx.createOscillator();
      o.type = k < 2 ? 'sine' : 'triangle';
      o.frequency.setValueAtTime(NOTE(ROOT + iv), t);
      o.frequency.setValueAtTime(NOTE(ROOT + iv), t + 1.2);
      o.frequency.exponentialRampToValueAtTime(NOTE(ROOT + iv - 1), t + len);
      o.detune.value = det;
      const g = ctx.createGain(); g.gain.value = k === 0 ? 0.5 : 0.22;
      o.connect(g).connect(lp);
      o.start(t); o.stop(t + len + 0.05);
    });
  });

  /* faíscas: notas agudas esparsas, cada vez mais baixas */
  for (let i = 0; i < 9; i++) {
    const at = t + 0.8 + i * 0.28 + Math.random() * 0.12;
    voice(at, pentaNote(3), { type: 'sine', amp: 0.03 * (1 - i / 11), decay: 0.6, send: 0.9 });
  }
}
