/* Utilitários compartilhados pela cena. */
import * as THREE from 'three';

export const fire = (name, detail) => dispatchEvent(new CustomEvent(name, { detail }));
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const isSmall = () => matchMedia('(max-width: 820px)').matches;

/* pontos de um círculo no plano XZ */
export function ringPoints(r, n = 96) {
  const pts = [];
  for (let j = 0; j <= n; j++) {
    const a = (j / n) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
  }
  return pts;
}

export function ringLine(r, material, n = 96) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints(r, n)), material);
}

/* textura de brilho radial (estrelas, halos e nebulosas de reserva) */
export function glowTexture(soft = 2.2, noise = 0) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.18, 'rgba(255,255,255,.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  if (noise) {
    const im = g.getImageData(0, 0, 256, 256);
    for (let i = 0; i < im.data.length; i += 4) im.data[i + 3] *= Math.pow(0.55 + Math.random() * 0.45 * noise, soft);
    g.putImageData(im, 0, 0);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function glowSprite(map, color, opacity, scale) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(scale);
  return s;
}
