/* Efeito de salto de dobra: linhas presas à câmera que esticam com a
   intensidade (0–1), mais abertura do campo de visão. */
import * as THREE from 'three';

export function createWarp(camera, baseFov = 50) {
  const N = 360, pos = new Float32Array(N * 6);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, r = 1.5 + Math.random() * 7, z = -5 - Math.random() * 60;
    pos.set([Math.cos(a) * r, Math.sin(a) * r, z, Math.cos(a) * r, Math.sin(a) * r, z - 1], i * 6);
  }
  const lines = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)),
    new THREE.LineBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  camera.add(lines);

  return {
    set(k) {
      lines.material.opacity = k * 0.85;
      lines.scale.z = 1 + k * 22;
      camera.fov = baseFov + k * 26;
      camera.updateProjectionMatrix();
    }
  };
}
