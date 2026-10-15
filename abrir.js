// Abre a Forja 3D:  node abrir.js
// Sobe o servidor local escondido (se ainda não estiver rodando) e abre o app numa janela própria do Chrome ou do Edge,
// com uma pasta de navegador só dela: os projetos (salvos no navegador) ficam em %LocalAppData%\Forja 3D\navegador.
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4630;
const URL_APP = `http://127.0.0.1:${PORT}/`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const ping = () => new Promise(resolve => {
  const req = http.get(URL_APP + '__vivo', res => { res.resume(); resolve(true); });
  req.on('error', () => resolve(false));
  req.setTimeout(800, () => { req.destroy(); resolve(false); });
});

(async () => {
  if (!(await ping())) {
    spawn(process.execPath, [path.join(__dirname, 'serve.js'), String(PORT), '--auto-fechar'], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
    for (let i = 0; i < 40 && !(await ping()); i++) await wait(150);
  }
  // node abrir.js --rede: já libera o acesso pelo celular (o mesmo que o botão "Celular" do app)
  if (process.argv.includes('--rede')) await new Promise(r => { const q = http.request(URL_APP + 'api/rede?ligar=1', { method: 'POST' }, res => { res.resume(); res.on('end', r); }); q.on('error', r); q.end(); });
  const L = process.env.LOCALAPPDATA || '', PF = process.env.ProgramFiles || '', PF86 = process.env['ProgramFiles(x86)'] || '';
  const nav = [
    `${PF}\\Google\\Chrome\\Application\\chrome.exe`, `${PF86}\\Google\\Chrome\\Application\\chrome.exe`, `${L}\\Google\\Chrome\\Application\\chrome.exe`,
    `${PF86}\\Microsoft\\Edge\\Application\\msedge.exe`, `${PF}\\Microsoft\\Edge\\Application\\msedge.exe`,
  ].find(p => fs.existsSync(p));
  if (!nav) { spawn('cmd', ['/c', 'start', '', URL_APP], { detached: true, stdio: 'ignore', windowsHide: true }).unref(); return; }
  spawn(nav, [
    `--user-data-dir=${path.join(L, 'Forja 3D', 'navegador')}`,
    '--no-first-run', '--no-default-browser-check',
    // sem isso o navegador congela o "estou viva" da janela minimizada e o servidor fecharia com o app aberto
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
    '--window-size=1400,880', `--app=${URL_APP}`,
  ], { detached: true, stdio: 'ignore' }).unref();
})();
