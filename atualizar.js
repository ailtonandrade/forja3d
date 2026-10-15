// Atualização automática da Forja 3D instalada: o servidor confere a versão publicada na release mais recente do
// GitHub e o app mostra o botão "Atualizar para X". Ele baixa o setup novo, confere e instala por cima em modo
// silencioso; o instalador fecha este servidor, sobe o novo e a página recarrega sozinha. Os projetos não são tocados.
//
// Segurança: o manifesto (versão, nome do arquivo e SHA-256 do setup) vem ASSINADO com a chave privada do dono, que
// fica só no PC dele (%USERPROFILE%\.forja3d, fora do projeto). Aqui vai só a chave pública: manifesto sem assinatura
// válida é ignorado, e o setup só roda se o SHA-256 do arquivo baixado bater com o do manifesto assinado.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const ROOT = __dirname;
const REPO = 'ailtonandrade/forja3d';
const MANIFESTO = process.env.FORJA_MANIFESTO || `https://github.com/${REPO}/releases/latest/download/atualizacao.json`;
const BAIXAR = process.env.FORJA_DOWNLOADS || `https://github.com/${REPO}/releases/download`;
const CHAVE_PUBLICA = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAmm9h9oEM5lRkbaJP4rHfrsgy7x9r36BLh/0/xf2Qb7A=
-----END PUBLIC KEY-----`;

const versaoLocal = () => { try { return fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim(); } catch { return '0.0.0'; } };
// só a cópia instalada pelo setup (com o desinstalador ao lado) se atualiza sozinha; a de desenvolvimento usa o Git
const instalado = () => fs.existsSync(path.join(ROOT, 'unins000.exe'));
const cmp = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return Math.sign(d); } return 0; };
// o que é assinado: versão, nome do arquivo e SHA-256 (uma linha cada)
const conteudo = m => `${m.versao}\n${m.arquivo}\n${m.sha256}`;
function assinaturaOk(m) {
  try {
    if (!/^\d+(\.\d+){1,3}$/.test(m.versao) || !/^[\w.-]+\.exe$/.test(m.arquivo) || !/^[0-9a-f]{64}$/.test(m.sha256)) return false;
    return crypto.verify(null, Buffer.from(conteudo(m)), CHAVE_PUBLICA, Buffer.from(String(m.assinatura || ''), 'base64'));
  } catch { return false; }
}

let manifesto = null;
const st = { atual: versaoLocal(), nova: null, disponivel: false, instalado: instalado(), fase: 'ok', pct: 0, erro: null };

async function conferir() {
  try {
    const r = await fetch(MANIFESTO, { cache: 'no-store' });
    if (!r.ok) return;
    const m = await r.json();
    if (!assinaturaOk(m)) { console.warn('[atualização] manifesto com assinatura inválida: ignorado'); return; }
    manifesto = m; st.nova = m.versao; st.disponivel = cmp(m.versao, st.atual) > 0;
  } catch { /* sem internet: tenta de novo mais tarde */ }
}

// baixa o setup para a pasta temporária conferindo o SHA-256 (devolve o caminho do arquivo)
async function baixar() {
  const m = manifesto, dir = path.join(os.tmpdir(), 'forja3d-atualizacao');
  fs.mkdirSync(dir, { recursive: true });
  const destino = path.join(dir, m.arquivo);
  const r = await fetch(`${BAIXAR}/v${m.versao}/${m.arquivo}`);
  if (!r.ok || !r.body) throw new Error(`não deu pra baixar (${r.status})`);
  const total = Number(r.headers.get('content-length')) || Number(m.tamanho) || 0, hash = crypto.createHash('sha256');
  const out = fs.createWriteStream(destino);
  let feito = 0;
  for await (const parte of r.body) {
    hash.update(parte); feito += parte.length; if (total) st.pct = Math.min(99, Math.round(feito / total * 100));
    if (!out.write(parte)) await new Promise(res => out.once('drain', res));
  }
  await new Promise((res, rej) => out.end(err => err ? rej(err) : res()));
  if (hash.digest('hex') !== m.sha256) { try { fs.unlinkSync(destino); } catch {} throw new Error('o arquivo baixado não confere com a versão assinada (tente de novo)'); }
  return destino;
}

// "Atualizar agora": baixa, confere e roda o instalador em silêncio (ele fecha este servidor e sobe o novo)
function instalar() {
  if (!manifesto || !st.disponivel) return { erro: 'Nenhuma atualização disponível.' };
  if (!st.instalado) return { erro: 'Esta é a cópia de desenvolvimento: atualize pelo Git.' };
  if (st.fase === 'baixando' || st.fase === 'instalando') return {};
  st.fase = 'baixando'; st.pct = 0; st.erro = null;
  (async () => {
    try {
      const arq = await baixar();
      st.fase = 'instalando'; st.pct = 100;
      spawn(arq, ['/VERYSILENT', '/SUPPRESSMSGBOXES', '/NORESTART', '/ATUALIZACAO'], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
    } catch (e) { st.fase = 'erro'; st.erro = String(e && e.message || e); }
  })();
  return {};
}

setInterval(conferir, 30 * 60e3).unref();
conferir();
module.exports = { estado: () => ({ ...st }), conferir, instalar };
