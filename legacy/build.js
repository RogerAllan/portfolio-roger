const fs = require('fs');
const path = require('path');

const dir = __dirname;
const tpl = fs.readFileSync(path.join(dir, 'index.template.html'), 'utf8');

const map = {
  phantom: 'assets/phantomroleta.com.br.jpg',
  demandas: 'assets/demandas.jpg',
};

function dataUri(rel) {
  const b64 = fs.readFileSync(path.join(dir, rel)).toString('base64');
  return 'data:image/jpeg;base64,' + b64;
}

let out = tpl;
let total = 0;
for (const [key, rel] of Object.entries(map)) {
  const uri = dataUri(rel);
  total += uri.length;
  out = out.split('{{IMG:' + key + '}}').join(uri);
}

const leftover = out.match(/\{\{IMG:[^}]+\}\}/g);
if (leftover) { console.error('UNRESOLVED placeholders:', leftover); process.exit(1); }

fs.writeFileSync(path.join(dir, 'index.html'), out);
console.log('index.html written:', (out.length / 1024).toFixed(0) + 'KB total,',
  (total / 1024).toFixed(0) + 'KB inlined images');
