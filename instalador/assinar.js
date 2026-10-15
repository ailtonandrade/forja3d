// Assina um setup para a atualização automática: grava o atualizacao.json (versão, arquivo, SHA-256 e assinatura)
// ao lado do .exe. O build.ps1 chama sozinho:  node instalador/assinar.js <setup.exe> <versão>
// A chave privada fica FORA do projeto: %USERPROFILE%\.forja3d\chave-atualizacao.pem. Faça backup dela: sem ela,
// as Forjas já instaladas não aceitam mais nenhuma versão nova (aí só reinstalando à mão).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const [setup, versao] = process.argv.slice(2);
const CHAVE = process.env.FORJA_CHAVE || path.join(process.env.USERPROFILE || process.env.HOME || '', '.forja3d', 'chave-atualizacao.pem');
if (!setup || !versao) { console.error('uso: node assinar.js <setup.exe> <versão>'); process.exit(1); }
if (!fs.existsSync(CHAVE)) { console.error(`chave privada não encontrada: ${CHAVE}`); process.exit(1); }

const dados = fs.readFileSync(setup);
const m = { versao, arquivo: path.basename(setup), sha256: crypto.createHash('sha256').update(dados).digest('hex'), tamanho: dados.length };
m.assinatura = crypto.sign(null, Buffer.from(`${m.versao}\n${m.arquivo}\n${m.sha256}`), fs.readFileSync(CHAVE)).toString('base64');
const saida = path.join(path.dirname(setup), 'atualizacao.json');
fs.writeFileSync(saida, JSON.stringify(m, null, 2));
console.log(`assinado: ${saida} (${m.arquivo}, sha256 ${m.sha256.slice(0, 12)}...)`);
