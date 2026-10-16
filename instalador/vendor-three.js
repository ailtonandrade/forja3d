// Copia só os arquivos do three.js que a Forja usa (e tudo que eles importam) para a pasta do app, pra funcionar offline.
//   node vendor-three.js <pasta do pacote three> <destino>
const fs = require('fs');
const path = require('path');

const [src, dst] = process.argv.slice(2);
const entries = [
  'LICENSE',
  'build/three.module.js',
  'examples/jsm/controls/OrbitControls.js',
  'examples/jsm/controls/TransformControls.js',
  'examples/jsm/environments/RoomEnvironment.js',
  'examples/jsm/exporters/GLTFExporter.js',
  'examples/jsm/loaders/GLTFLoader.js',
  'examples/jsm/lights/RectAreaLightUniformsLib.js',
  'examples/jsm/lines/LineSegments2.js',
];
const seen = new Set(), queue = [...entries];
while (queue.length) {
  const rel = queue.pop();
  if (seen.has(rel)) continue;
  seen.add(rel);
  const from = path.join(src, rel), to = path.join(dst, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  if (!rel.endsWith('.js')) continue;
  const code = fs.readFileSync(from, 'utf8');
  for (const m of code.matchAll(/(?:import|export)\s[^;]*?from\s*['"](\.{1,2}\/[^'"]+)['"]/g))
    queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[1])));
}
console.log(`three.js embutido: ${seen.size} arquivos`);
