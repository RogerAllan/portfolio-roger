/* A nave do visitante e o portal de entrada.
   Viagem: a cada destino a nave decola de onde está e voa por uma curva de
   Bézier em arco (sobe, inclina na curva, desce no destino) deixando rastro do
   motor. Parada: orbita o sistema devagar. Formas de reserva até o glTF chegar. */
import * as THREE from 'three';
import { ease, glowSprite } from './util.js';

const TRAIL = 70;
const SHIP_ALT = 2.2;          /* altura da órbita da nave, acima do plano dos planetas */

/* alinha o maior eixo do modelo com +Z, que é a frente para o lookAt */
function noseForward(obj) {
  const v = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
  if (v.x >= v.y && v.x >= v.z) obj.rotation.y = -Math.PI / 2;
  else if (v.y >= v.x && v.y >= v.z) obj.rotation.x = Math.PI / 2;
  const holder = new THREE.Group();
  holder.add(obj);
  return holder;
}

function buildTrail() {
  const pos = new Float32Array(TRAIL * 3), col = new Float32Array(TRAIL * 3);
  const c = new THREE.Color(0x3fd1c4);
  for (let i = 0; i < TRAIL; i++) {
    const f = 1 - i / TRAIL;
    col.set([c.r * f, c.g * f, c.b * f], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  line.frustumCulled = false;
  return line;
}

export function createFleet(originPos, glow) {
  /* nave */
  const ship = new THREE.Group();
  const body = new THREE.Group();          /* recebe a inclinação (bank) */
  ship.add(body);
  const shipFallback = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.8, 5).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x1a1c22, roughness: 0.4, metalness: 0.7, emissive: 0x0c3a36, emissiveIntensity: 0.6 })
  );
  body.add(shipFallback);
  const engine = glowSprite(glow, 0x3fd1c4, 0.0, 0.9);
  engine.position.z = -0.55;
  body.add(engine);

  const trail = buildTrail();
  const trailPos = trail.geometry.attributes.position;

  /* portal */
  const gate = new THREE.Group();
  const gateFallback = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.22, 10, 64),
    new THREE.MeshStandardMaterial({ color: 0x2c2620, roughness: 0.8, metalness: 0.5, emissive: 0x3a0d0d, emissiveIntensity: 0.5 })
  );
  gate.add(gateFallback);
  gate.position.set(originPos.x + 9, 1, originPos.z + 7);
  gate.lookAt(0, 0, 0);

  /* estado de voo */
  const anchor = originPos.clone();
  let orbitR = 4.5, orbitA = 0, curve = null, prog = 1, dur = 2.2, bank = 0;
  const tmp = new THREE.Vector3(), ahead = new THREE.Vector3(), lastTan = new THREE.Vector3(0, 0, 1);
  const aim = new THREE.Object3D(), UP = new THREE.Vector3(0, 1, 0);

  /* gira a nave aos poucos até apontar de `from` para `to` (sem tremer) */
  function steer(from, to, dt, rate) {
    aim.position.copy(from);
    aim.up.copy(UP);
    aim.lookAt(to);
    ship.quaternion.slerp(aim.quaternion, Math.min(1, dt * rate));
  }
  ship.position.copy(anchor).add(new THREE.Vector3(orbitR, 1, 0));
  for (let i = 0; i < TRAIL; i++) trailPos.setXYZ(i, ship.position.x, ship.position.y, ship.position.z);

  function orbitPoint(a, out) {
    return out.set(anchor.x + Math.cos(a) * orbitR, anchor.y + SHIP_ALT, anchor.z + Math.sin(a) * orbitR);
  }

  return {
    ship, gate, trail,
    get flying() { return prog < 1; },
    setShipModel(obj) { shipFallback.visible = false; body.add(noseForward(obj)); },
    setGateModel(obj) { gateFallback.visible = false; gate.add(obj); },

    /* decola de onde está e voa até o sistema em `duration` segundos */
    flyTo(pos, isCore, duration = 2.2) {
      anchor.copy(pos);
      orbitR = isCore ? 19 : 4.5;
      const start = ship.position.clone();
      orbitA = Math.atan2(start.z - anchor.z, start.x - anchor.x);
      const end = orbitPoint(orbitA, new THREE.Vector3());
      const dist = start.distanceTo(end);
      const lift = new THREE.Vector3(0, Math.max(3, dist * 0.22), 0);
      const side = new THREE.Vector3(-(end.z - start.z), 0, end.x - start.x).normalize().multiplyScalar(dist * 0.18);
      curve = new THREE.CubicBezierCurve3(
        start,
        start.clone().lerp(end, 0.3).add(lift).add(side),
        start.clone().lerp(end, 0.75).add(lift.clone().multiplyScalar(0.5)).add(side),
        end
      );
      prog = 0;
      dur = duration;
    },

    update(t, dt) {
      if (curve && prog < 1) {
        prog = Math.min(1, prog + dt / dur);
        const k = ease(prog);
        curve.getPointAt(k, tmp);
        const tan = curve.getTangentAt(Math.min(0.999, k + 0.001));
        /* inclina para o lado da curva, com a curvatura suavizada */
        const turn = THREE.MathUtils.clamp(lastTan.clone().cross(tan).y / Math.max(dt, 1e-3), -2, 2);
        bank += (THREE.MathUtils.clamp(-turn * 0.35, -0.5, 0.5) - bank) * Math.min(1, dt * 2);
        lastTan.copy(tan);
        ship.position.copy(tmp);
        steer(tmp, ahead.copy(tmp).add(tan), dt, 8);
        engine.material.opacity = 0.9;
      } else {
        /* órbita lenta em volta do sistema */
        orbitA += dt * (3.2 / Math.max(orbitR, 1)) * 0.25;
        const bob = Math.sin(t * 0.6) * 0.08;
        orbitPoint(orbitA, tmp);
        tmp.y += bob;
        ship.position.copy(tmp);
        orbitPoint(orbitA + 0.08, ahead);
        ahead.y += bob;
        steer(tmp, ahead, dt, 3);
        bank += (-0.18 - bank) * Math.min(1, dt * 1.5);
        engine.material.opacity += (0.35 - engine.material.opacity) * Math.min(1, dt * 2);
      }
      body.rotation.z = bank;
      engine.scale.setScalar(0.8 + Math.sin(t * 30) * 0.08 + engine.material.opacity * 0.5);

      /* rastro: desloca o histórico e grava a posição atual do motor */
      for (let i = TRAIL - 1; i > 0; i--) trailPos.setXYZ(i, trailPos.getX(i - 1), trailPos.getY(i - 1), trailPos.getZ(i - 1));
      engine.getWorldPosition(tmp);
      trailPos.setXYZ(0, tmp.x, tmp.y, tmp.z);
      trailPos.needsUpdate = true;

      gate.rotation.z = t * 0.05;
    }
  };
}
