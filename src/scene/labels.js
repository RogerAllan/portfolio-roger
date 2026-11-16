/* Rótulos DOM projetados da posição 3D a cada quadro:
   - sistemas: código e nome, no mapa;
   - planetas do sistema aberto: o que cada um representa (título) e, no
     planeta destacado, um cartão com o resumo. */
import * as THREE from 'three';

export function createLabels(host, systems) {
  const els = {};
  for (const S of systems) {
    const el = document.createElement('div');
    el.className = 'lbl' + (S.kind === 'quarantine' ? ' lbl-q' : '');
    el.innerHTML = `<span class="lbl-code">${S.code}</span><span class="lbl-name"></span>`;
    host.appendChild(el);
    els[S.id] = el;
  }
  const v = new THREE.Vector3();

  const info = {};          /* id -> [{ t, d }] */
  const pool = [];
  let shownFor = null;
  function planetEl(i) {
    if (!pool[i]) {
      const el = document.createElement('div');
      el.className = 'plbl';
      el.innerHTML = '<span class="plbl-t"></span><span class="plbl-d"></span>';
      host.appendChild(el);
      pool[i] = el;
    }
    return pool[i];
  }
  function fill(id) {
    const items = info[id] || [];
    pool.forEach((el, i) => { if (i >= items.length) el.style.opacity = '0'; });
    items.forEach((it, i) => {
      const el = planetEl(i);
      el.querySelector('.plbl-t').textContent = it.t;
      el.querySelector('.plbl-d').textContent = it.d || '';
    });
    shownFor = id;
  }

  return {
    setNames(names) { for (const id in els) els[id].querySelector('.lbl-name').textContent = names[id] ?? ''; },
    setPlanetInfo(map) { Object.assign(info, map); shownFor = null; },
    update({ camera, byId, mode, hover, current, planetHover }) {
      /* planetas do sistema aberto */
      const sysOn = mode === 'system' && current && info[current];
      if (sysOn && shownFor !== current) fill(current);
      if (!sysOn && shownFor) { pool.forEach((el) => { el.style.opacity = '0'; el.classList.remove('on'); }); shownFor = null; }
      if (sysOn) {
        const planets = byId[current].planets;
        (info[current] || []).forEach((_, i) => {
          const el = pool[i], p = planets[i];
          if (!el || !p) return;
          p.getWorldPosition(v);
          v.project(camera);
          const visible = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
          const on = i === planetHover;
          el.style.opacity = visible ? (on ? '1' : '.62') : '0';
          el.classList.toggle('on', on);
          if (visible) el.style.transform = `translate(${((v.x + 1) / 2 * innerWidth + 16).toFixed(1)}px, ${((1 - v.y) / 2 * innerHeight - 9).toFixed(1)}px)`;
        });
      }

      for (const id in els) {
        const el = els[id], s = byId[id];
        v.copy(s.g.position);
        v.y += s.isCore ? 6 : 2.2;
        v.project(camera);
        const visible = v.z < 1 && mode !== 'boot' && !(mode === 'system' && id !== current);
        const on = id === hover || id === current;
        el.style.opacity = visible ? (on ? '1' : '.7') : '0';
        if (visible) el.style.transform = `translate(${((v.x + 1) / 2 * innerWidth).toFixed(1)}px, ${((1 - v.y) / 2 * innerHeight).toFixed(1)}px)`;
        el.classList.toggle('on', on);
      }
    }
  };
}
