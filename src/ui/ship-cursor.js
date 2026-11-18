/* O cursor é a nave da carta estelar 3D (ship.glb renderizado de cima). O nariz marca
   o ponto exato do clique; a nave aponta para onde voa, deixa o mesmo rastro do motor
   e volta à pose de seta quando para. Só liga com mouse e sem o pedido de menos movimento. */
import { reduce } from './state.js';

const POSE = -28;        /* inclinação de repouso, como uma seta de mouse */
const TAIL = 35;         /* distância do nariz até o motor, em px */
const TRAIL_MS = 520;

export function initShipCursor() {
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const html = document.documentElement;

  const el = document.createElement('div');
  el.id = 'shipCursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="sc-hull"><i class="sc-flame"></i><img src="/assets/ship-cursor.webp" alt="" width="168" height="170" draggable="false" /></span>';
  const cv = document.createElement('canvas');
  cv.id = 'shipTrail';
  cv.setAttribute('aria-hidden', 'true');
  document.body.append(cv, el);
  const ctx = cv.getContext('2d');

  const size = () => {
    const k = Math.min(devicePixelRatio || 1, 1.5);
    cv.width = Math.round(innerWidth * k);
    cv.height = Math.round(innerHeight * k);
    ctx.setTransform(k, 0, 0, k, 0, 0);
  };
  size();
  addEventListener('resize', size);

  let x = 0, y = 0, angle = POSE, target = POSE, thrust = 0, lastMove = 0, lastFrame = 0, raf = 0;
  const trail = [];

  const place = () => { el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle.toFixed(1)}deg)`; };

  const frame = (now) => {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    const moving = now - lastMove < 90;
    if (now - lastMove > 260) target = POSE;

    /* gira pelo caminho mais curto */
    const delta = ((target - angle + 540) % 360) - 180;
    angle += delta * (1 - Math.exp(-dt * 15));
    thrust += ((moving ? Math.min(1, thrust + 0.5) : 0) - thrust) * (1 - Math.exp(-dt * 10));
    el.style.setProperty('--thrust', thrust.toFixed(2));
    place();

    if (moving) {
      const a = angle * Math.PI / 180;
      trail.unshift({ x: x - Math.sin(a) * TAIL, y: y + Math.cos(a) * TAIL, t: now });
    }
    while (trail.length && now - trail[trail.length - 1].t > TRAIL_MS) trail.pop();

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.lineCap = 'round';
    for (let i = 1; i < trail.length; i++) {
      const k = 1 - (now - trail[i].t) / TRAIL_MS;
      ctx.strokeStyle = `rgb(63 209 196 / ${(k * k * 0.85).toFixed(3)})`;
      ctx.lineWidth = 0.6 + k * 2.4;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }

    const settled = !trail.length && Math.abs(delta) < 0.2 && thrust < 0.01;
    raf = settled ? 0 : requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) { lastFrame = performance.now(); raf = requestAnimationFrame(frame); } };

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') { html.classList.remove('ship-cursor'); el.classList.remove('on'); return; }
    const dx = e.clientX - x, dy = e.clientY - y;
    const first = !el.classList.contains('on');
    x = e.clientX; y = e.clientY;
    if (first) { html.classList.add('ship-cursor'); el.classList.add('on'); }
    else if (Math.hypot(dx, dy) > 1.5) { target = Math.atan2(dx, -dy) * 180 / Math.PI; lastMove = performance.now(); }
    el.classList.toggle('is-hot', !!e.target.closest?.('a, button, summary, [role="button"]'));
    place();
    wake();
  }, { passive: true });

  addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    el.classList.add('is-down');
    const ping = document.createElement('i');
    ping.className = 'sc-ping';
    ping.style.left = `${e.clientX}px`;
    ping.style.top = `${e.clientY}px`;
    ping.addEventListener('animationend', () => ping.remove());
    document.body.append(ping);
  }, { passive: true });
  addEventListener('pointerup', () => el.classList.remove('is-down'), { passive: true });
  html.addEventListener('pointerleave', () => el.classList.remove('on'));
}
