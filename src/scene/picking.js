/* Ponteiro sobre o canvas: no mapa, passa o mouse e clica em sistemas; dentro
   de um sistema, passa o mouse e clica em planetas. Arrastar não conta clique. */
import * as THREE from 'three';

export function createPicking(canvas, camera, { getMode, getTargets, onHover, onSelect }) {
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let downAt = null;

  function pick(e) {
    const targets = getTargets();
    if (!targets.length) return null;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects(targets, false)[0] || null;
  }

  canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointermove', (e) => {
    const mode = getMode();
    if (mode !== 'map' && mode !== 'system') return;
    const h = pick(e);
    onHover(mode, h ? h.object.userData : null);
    canvas.style.cursor = h ? 'pointer' : mode === 'map' ? 'grab' : 'default';
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
    const mode = getMode();
    const h = pick(e);
    if (h) onSelect(mode, h.object.userData);
  });
}
