/* Prepara os modelos 3D baixados do Sketchfab para a web.
   Entrada: assets-src/sketchfab/*.glb (fora do git)
   Saída:   public/models/<papel>.glb e public/models/manifest.json (com os créditos)
   Uso:     node scripts/models.mjs
   Com @gltf-transform/cli instalado no projeto (devDependency), comprime com meshopt e
   texturas WebP ≤ 1024 px; sem ele, só copia os arquivos como vieram. */
import { readdirSync, mkdirSync, writeFileSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execFileSync } from 'node:child_process';

const SRC = 'assets-src/sketchfab';
const OUT = 'public/models';
const BIN = join('node_modules', '.bin', process.platform === 'win32' ? 'gltf-transform.cmd' : 'gltf-transform');
const compress = existsSync(BIN);

/* papel no mapa → padrão do nome do arquivo + crédito (licença CC BY 4.0) */
const ROLES = {
  ship:      { match: /organic.*ship|alien.*spaceship/i, credit: { name: 'Organic alien spaceship', author: 'RickStikkelorum', url: 'https://sketchfab.com/3d-models/af5018eeddab45919a11b9df3e86754c' } },
  gate:      { match: /alien.?ring/i,                   credit: { name: 'Alien Ring', author: 'Cogent', url: 'https://sketchfab.com/3d-models/9c288fb496ab4d15838c0517d0cef47c' } },
  eye:       { match: /cosmic.?eye|eye.?of/i,           credit: { name: 'Cosmic Eye of Horror', author: 'Huntaer87', url: 'https://sketchfab.com/3d-models/06da91d166d844b98bac8484652301cf' } },
  crystal:   { match: /crystal/i,                       credit: { name: 'Void-Touched Crystal Rock', author: 'PuzzledPapaya', url: 'https://sketchfab.com/3d-models/2eee63550ed6470dac7659211a605795' } }
};

mkdirSync(OUT, { recursive: true });
const files = readdirSync(SRC).filter((f) => f.toLowerCase().endsWith('.glb'));
const manifest = { credits: [] };
console.log(compress ? 'modo: comprimir (gltf-transform)' : 'modo: copiar sem compressão (instale @gltf-transform/cli para comprimir)');

for (const [role, { match, credit }] of Object.entries(ROLES)) {
  const f = files.find((x) => match.test(basename(x)));
  if (!f) { console.log(`- ${role}: nenhum arquivo encontrado`); continue; }
  const src = join(SRC, f), out = join(OUT, role + '.glb');
  if (compress) {
    execFileSync(BIN, ['optimize', src, out, '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '1024'], { stdio: 'inherit', shell: process.platform === 'win32' });
  } else {
    copyFileSync(src, out);
  }
  manifest[role] = role + '.glb';
  manifest.credits.push(credit);
  console.log(`+ ${role}: ${f} -> ${out} (${(statSync(out).size / 1e6).toFixed(2)} MB)`);
}

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('manifest:', Object.keys(manifest).filter((k) => k !== 'credits').join(', ') || 'vazio');
