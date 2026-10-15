// Servidor da Forja 3D:  node serve.js [porta] [--auto-fechar] [--sem-rede]
//   http://127.0.0.1:4630       neste computador
//   http://<ip-do-pc>:4631       pelo celular/tablet na mesma rede (já sobe ligado; --sem-rede ou o botão "Celular" desligam)
// Os projetos ficam salvos em arquivos neste computador (API /api/projetos), então o PC e o celular veem os mesmos.
// --auto-fechar: cada tela aberta manda um "estou viva" a cada 4 s; sem nenhum sinal por 90 s, o servidor sai sozinho.
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const atualizar = require('./atualizar');   // atualização automática (versão publicada no GitHub, assinada)

const PORT = Number(process.argv[2] || process.env.PORT || 4630);
const PORT_REDE = PORT + 1;
const AUTO = process.argv.includes('--auto-fechar');
const ROOT = __dirname;
const VERSION = (() => { try { return fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim(); } catch { return 'dev'; } })();
// instalado (com o Node embutido): projetos ficam no perfil do usuário, fora da pasta do programa
const DATA = process.env.FORJA_DADOS || (fs.existsSync(path.join(ROOT, 'runtime'))
  ? path.join(process.env.LOCALAPPDATA || os.homedir(), 'Forja 3D', 'projetos')
  : path.join(ROOT, 'projetos'));
fs.mkdirSync(DATA, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream' };
const BEAT = "\n<script>setInterval(() => fetch('/__vivo', { cache: 'no-store' }).catch(() => {}), 4000)</script>\n";
const ID_OK = /^[A-Za-z0-9_-]{1,40}$/;
const MAX_BODY = 300 * 1024 * 1024;

let last = Date.now();
let lanServers = [];

// Só endereços de rede privada (10.x, 172.16-31.x, 192.168.x): o acesso pela rede nunca fica aberto num IP público
// (VPN, nuvem). Fica de fora adaptador com máscara /32 (túnel de VPN: nenhum aparelho da rede alcança).
// Wi-Fi primeiro, depois cabo; rede de casa (192.168.x) antes de 10.x; hotspot do Windows (192.168.137.x) e
// adaptadores virtuais por último.
const isPrivate = ip => /^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
function lanAddrs() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) for (const n of list || [])
    if (n.family === 'IPv4' && !n.internal && isPrivate(n.address) && n.netmask !== '255.255.255.255') {
      const score = (/wi-?fi|wlan|wireless/i.test(name) ? 0 : /ethernet|^eth|^en/i.test(name) ? 1 : 2) + (n.address.startsWith('192.168.') ? 0 : 0.5)
        + (/virtual|vmware|vbox|hyper-v|vethernet|wsl|docker/i.test(name) || n.address.startsWith('192.168.137.') ? 4 : 0);
      out.push({ address: n.address, score });
    }
  return out.sort((a, b) => a.score - b.score).map(a => a.address);
}
const lanUrls = () => lanServers.map(s => `http://${s.address}:${PORT_REDE}/`);
const isLocal = req => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
const isPrivateReq = req => isLocal(req) || isPrivate(String(req.socket.remoteAddress).replace(/^::ffff:/, ''));
function sendJson(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); }
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new Error('projeto grande demais')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
const file = (id, ext) => path.join(DATA, id + ext);

// um servidor escutando em cada IP privado deste PC (nunca em 0.0.0.0)
async function setRede(on) {
  for (const s of lanServers) { s.server.close(); s.server.closeAllConnections?.(); }
  lanServers = [];
  if (!on) return true;
  for (const address of lanAddrs()) {
    const server = http.createServer(handler);
    const ok = await new Promise(res => { server.once('error', () => res(false)); server.listen(PORT_REDE, address, () => res(true)); });
    if (ok) lanServers.push({ address, server });
  }
  console.log('Celular:', lanUrls().join('  ') || '(nenhuma rede privada encontrada)');
  return lanServers.length > 0;
}

async function api(req, res, u) {
  const parts = u.pathname.split('/').filter(Boolean); // ['api', ...]
  if (parts[1] === 'info') return sendJson(res, 200, { versao: VERSION, rede: lanServers.length > 0, urls: lanUrls(), local: isLocal(req) });
  if (parts[1] === 'rede' && req.method === 'POST') {
    if (!isLocal(req)) return sendJson(res, 403, { erro: 'Só o próprio computador pode ligar ou desligar o acesso pela rede.' });
    const on = u.searchParams.get('ligar') !== '0';
    const ok = await setRede(on);
    return sendJson(res, ok || !on ? 200 : 500, { rede: lanServers.length > 0, urls: lanUrls() });
  }
  if (parts[1] === 'atualizacao') {
    if (req.method !== 'POST') return sendJson(res, 200, atualizar.estado());
    if (!isLocal(req)) return sendJson(res, 403, { erro: 'Só o próprio computador pode instalar atualizações.' });
    const r = atualizar.instalar();
    return sendJson(res, r.erro ? 400 : 200, r.erro ? r : atualizar.estado());
  }
  if (parts[1] !== 'projetos') return sendJson(res, 404, { erro: 'rota desconhecida' });
  const id = parts[2];
  if (!id) {
    const list = [];
    for (const f of fs.readdirSync(DATA)) if (f.endsWith('.meta.json')) { try { list.push(JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'))); } catch {} }
    return sendJson(res, 200, list);
  }
  if (!ID_OK.test(id)) return sendJson(res, 400, { erro: 'id inválido' });
  if (req.method === 'GET') {
    if (!fs.existsSync(file(id, '.json'))) return sendJson(res, 404, { erro: 'projeto não existe' });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return fs.createReadStream(file(id, '.json')).pipe(res);
  }
  if (req.method === 'PUT') {
    let p;
    try { p = JSON.parse((await readBody(req)).toString('utf8')); } catch (e) { return sendJson(res, 400, { erro: 'JSON inválido: ' + e.message }); }
    if (p.id !== id || !Array.isArray(p.objects)) return sendJson(res, 400, { erro: 'projeto inválido' });
    const meta = { id, name: String(p.name || 'Projeto'), created: p.created || Date.now(), updated: p.updated || Date.now(), thumb: p.thumb || null, count: p.objects.length };
    // grava num temporário e troca: um salvamento cortado no meio não estraga o projeto
    fs.writeFileSync(file(id, '.json.tmp'), JSON.stringify(p));
    fs.renameSync(file(id, '.json.tmp'), file(id, '.json'));
    fs.writeFileSync(file(id, '.meta.json'), JSON.stringify(meta));
    return sendJson(res, 200, meta);
  }
  if (req.method === 'DELETE') {
    for (const ext of ['.json', '.meta.json']) fs.rmSync(file(id, ext), { force: true });
    return sendJson(res, 200, { ok: true });
  }
  sendJson(res, 405, { erro: 'método não suportado' });
}

function handler(req, res) {
  const u = new URL(req.url, 'http://local');
  if (!isPrivateReq(req)) { res.writeHead(403); return res.end(); }
  if (u.pathname === '/__vivo') { last = Date.now(); res.writeHead(204); return res.end(); }
  if (u.pathname.startsWith('/api/')) {
    last = Date.now();
    return api(req, res, u).catch(e => sendJson(res, 500, { erro: e.message }));
  }
  let p = decodeURIComponent(u.pathname);
  if (p === '/') p = '/index.html';
  if (p === '/favicon.ico') p = '/assets/icone.ico';
  const f = path.join(ROOT, path.normalize(p));
  if (!f.startsWith(ROOT + path.sep) || f.startsWith(path.join(ROOT, 'runtime')) || f.startsWith(path.join(ROOT, 'projetos'))) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Não encontrado'); }
    const ext = path.extname(f).toLowerCase();
    if (ext === '.html' && AUTO) data = Buffer.concat([data, Buffer.from(BEAT)]);
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

const server = http.createServer(handler);
server.on('error', e => {
  if (e.code === 'EADDRINUSE') { console.log(`A porta ${PORT} já está em uso (a Forja já está aberta?).`); process.exit(0); }
  throw e;
});
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Forja 3D ${VERSION} em http://127.0.0.1:${PORT}  ·  projetos em ${DATA}`);
  // acesso pelo celular ligado por padrão (só em IPs de rede privada)
  if (!process.argv.includes('--sem-rede')) setRede(true);
});
if (AUTO) setInterval(() => { if (Date.now() - last > 90000) process.exit(0); }, 5000);
