// Gera o modelo padrão da Forja 3D: ilha flutuante com casinha estilo Pixar, texturas procedurais e um humano esculpido.
// node exemplos/gerar-casinha.js exemplos/casinha-e-boneco.forja.json  -> e o mesmo conteúdo vai embutido no index.html (tag id="tplPadrao").
const fs = require('fs');
const out = process.argv[2];
let n = 0; const uid = p => p + '_' + (++n).toString(36) + Math.random().toString(36).slice(2, 6);
const r4 = v => Math.round(v * 1e4) / 1e4;

// ---------- texturas (receitas: o app desenha cada uma ao abrir, sempre igual pela semente) ----------
const TEX = {};
const T = (name, kind, seed, o = {}) => { const id = 'tx_' + kind + '_' + seed; TEX[id] = { name, gen: { kind, seed, ...o } }; return id; };
const tGrama = T('Grama', 'grama', 11), tTerra = T('Terra', 'terra', 12), tPedra = T('Pedras', 'pedras', 13);
const tReboco = T('Reboco creme', 'reboco', 14, { base: '#f0d7a6' }), tTelha = T('Telhas', 'telhas', 15, { base: '#cf4b2e' });
const tTijolo = T('Tijolos', 'bricks', 16, { base: '#b0503a' }), tPorta = T('Tábuas da porta', 'tabuas', 17, { base: '#2f8f9d', n: 4 });
const tMadeira = T('Tábuas', 'tabuas', 18, { base: '#9b6a43' }), tCasca = T('Casca', 'casca', 19);
const tFolha = T('Folhagem', 'folhas', 20, { base: '#45a332' }), tFolha2 = T('Folhagem escura', 'folhas', 21, { base: '#2f7d24' });
const tJeans = T('Jeans', 'jeans', 22), tCamisa = T('Malha da camisa', 'tecido', 23, { base: '#e8a03c' });
const tCouro = T('Couro', 'couro', 24), tCabelo = T('Cabelo', 'cabelo', 25), tPoros = T('Poros da pele', 'noise', 26);

// ---------- materiais (com textura a cor do material fica branca: quem pinta é a textura) ----------
const mats = [];
const M = (name, o) => { const m = { id: uid('m'), name, color: '#cccccc', metalness: 0, roughness: 0.6, emissive: '#000000', emissiveIntensity: 1, opacity: 1, wireframe: false, flat: false, doubleSided: false, map: null, bump: null, bumpScale: 1, repeat: [1, 1], ...o }; mats.push(m); return m.id; };
const W = '#ffffff';
const grama = M('Grama', { color: W, map: tGrama, bump: tGrama, bumpScale: 1.2, repeat: [5, 5], roughness: 0.95 });
const terra = M('Terra', { color: W, map: tTerra, bump: tTerra, bumpScale: 2, repeat: [3, 2], roughness: 1 });
const pedra = M('Pedra', { color: W, map: tPedra, bump: tPedra, bumpScale: 2.5, repeat: [2, 1], roughness: 0.9 });
const parede = M('Reboco', { color: W, map: tReboco, bump: tReboco, bumpScale: 1, repeat: [2, 2], roughness: 0.85 });
const telhado = M('Telhado', { color: W, map: tTelha, bump: tTelha, bumpScale: 3, repeat: [4, 3], roughness: 0.6 });
const tijolo = M('Tijolo', { color: W, map: tTijolo, bump: tTijolo, bumpScale: 2, repeat: [2, 2], roughness: 0.85 });
const porta = M('Porta', { color: W, map: tPorta, bump: tPorta, bumpScale: 1.5, roughness: 0.55 });
const ouro = M('Maçaneta', { color: '#e6b84a', metalness: 1, roughness: 0.25 });
const moldura = M('Moldura branca', { color: '#fffaf0', roughness: 0.5 });
const vidro = M('Janela acesa', { color: '#ffe7a8', emissive: '#ffae42', emissiveIntensity: 0.9, roughness: 0.2 });
const madeira = M('Madeira', { color: W, map: tMadeira, bump: tMadeira, bumpScale: 1.5, roughness: 0.8 });
const fumaca = M('Fumaça', { color: '#ffffff', roughness: 1, opacity: 0.7 });
const folha = M('Folhagem', { color: W, map: tFolha, bump: tFolha, bumpScale: 2, repeat: [3, 2], roughness: 0.8 });
const folha2 = M('Folhagem escura', { color: W, map: tFolha2, bump: tFolha2, bumpScale: 2, repeat: [3, 2], roughness: 0.8 });
const tronco = M('Tronco', { color: W, map: tCasca, bump: tCasca, bumpScale: 3, repeat: [2, 1], roughness: 0.95 });
const rosa = M('Flor rosa', { color: '#ff7eb3', roughness: 0.6 });
const amarela = M('Flor amarela', { color: '#ffd23f', roughness: 0.6 });
const roxa = M('Flor roxa', { color: '#9b6dff', roughness: 0.6 });
const correio = M('Caixa de correio', { color: '#3d7bd9', roughness: 0.45 });
// humano
const pele = M('Pele', { color: '#e2a67e', roughness: 0.55, bump: tPoros, bumpScale: 0.12, repeat: [6, 6] });
const camisa = M('Camisa', { color: W, map: tCamisa, bump: tCamisa, bumpScale: 0.8, repeat: [3, 3], roughness: 0.85 });
const jeans = M('Jeans', { color: W, map: tJeans, bump: tJeans, bumpScale: 0.8, repeat: [2, 3], roughness: 0.9 });
const sapato = M('Tênis de couro', { color: W, map: tCouro, bump: tCouro, bumpScale: 1, roughness: 0.5 });
const cabelo = M('Cabelo', { color: W, map: tCabelo, bump: tCabelo, bumpScale: 1.5, repeat: [3, 1], roughness: 0.6, doubleSided: true });
const olhoBranco = M('Olho (branco)', { color: '#f4f1ec', roughness: 0.15 });
const iris = M('Íris', { color: '#3a2618', roughness: 0.1 });
const labio = M('Lábios', { color: '#b8685a', roughness: 0.45 });
const sobrancelha = M('Sobrancelha', { color: '#3b2416', roughness: 0.8 });

// ---------- malhas próprias (para deformar e dar o ar "desenhado à mão") ----------
function mesh() {
  const P = [], U = [], I = [];
  // face em grade: origem o, lados u e v (u x v aponta para fora), nu x nv divisões
  const face = (o, u, v, nu, nv) => {
    const base = P.length / 3;
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const a = i / nu, b = j / nv; P.push(o[0] + u[0] * a + v[0] * b, o[1] + u[1] * a + v[1] * b, o[2] + u[2] * a + v[2] * b); U.push(a, b); }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const k = base + j * (nu + 1) + i; I.push(k, k + 1, k + nu + 2, k, k + nu + 2, k + nu + 1); }
  };
  const tri = (a, b, c) => { const k = P.length / 3; P.push(...a, ...b, ...c); U.push(0, 0, 1, 0, 0.5, 1); I.push(k, k + 1, k + 2); };
  const deform = f => { for (let i = 0; i < P.length; i += 3) { const v = f(P[i], P[i + 1], P[i + 2]); P[i] = v[0]; P[i + 1] = v[1]; P[i + 2] = v[2]; } };
  const geo = () => ({ position: P.map(r4), uv: U.map(r4), index: I });
  return { face, tri, deform, geo };
}
function box(w, h, d, nd = 1) {
  const m = mesh(), x = w / 2, y = h / 2, z = d / 2;
  m.face([x, -y, z], [0, 0, -d], [0, h, 0], nd, nd);
  m.face([-x, -y, -z], [0, 0, d], [0, h, 0], nd, nd);
  m.face([-x, -y, z], [w, 0, 0], [0, h, 0], nd, nd);
  m.face([x, -y, -z], [-w, 0, 0], [0, h, 0], nd, nd);
  m.face([-x, y, z], [w, 0, 0], [0, 0, -d], nd, nd);
  m.face([-x, -y, -z], [w, 0, 0], [0, 0, d], nd, nd);
  return m;
}
// telhado: prisma triangular com a cumeeira ao longo de X (base em y = 0)
function roof(W, D, H) {
  const m = mesh(), x = W / 2;
  m.face([-x, 0, D], [W, 0, 0], [0, H, -D], 12, 5);
  m.face([x, 0, -D], [-W, 0, 0], [0, H, D], 12, 5);
  m.face([-x, 0, -D], [W, 0, 0], [0, 0, 2 * D], 12, 2);
  // laterais (empenas): leque com exatamente os mesmos pontos das bordas das águas e da base, então a
  // deformação move tudo junto e não abre fresta (mesmas contas de face(), para dar o mesmo número)
  const gable = pts => { const c = [pts[0][0], H / 3, 0]; for (let k = 0; k < pts.length; k++) m.tri(c, pts[k], pts[(k + 1) % pts.length]); };
  const steps = (n, f) => Array.from({ length: n + 1 }, (_, j) => f(j / n));
  const base = sx => steps(2, t => [sx, 0, -D + 2 * D * t]);
  gable([...base(x).reverse(), ...steps(5, b => [x, H * b, -D + D * b]).slice(1), ...steps(5, b => [-x + W, H * b, D + -D * b]).reverse().slice(1, -1)]);
  gable([...base(-x), ...steps(5, b => [-x, H * b, D + -D * b]).slice(1), ...steps(5, b => [x - W, H * b, -D + D * b]).reverse().slice(1, -1)]);
  return m;
}

// ---------- objetos ----------
const objs = [];
const O = (name, prim, shape, mat, pos, rot = [0, 0, 0], scl = [1, 1, 1]) => {
  const o = { id: uid('o'), name, prim, mat, pos: pos.map(r4), rot: rot.map(r4), scl: scl.map(r4), visible: true };
  if (prim === 'custom') o.geo = shape; else o.params = shape;
  objs.push(o); return o;
};
const PI = Math.PI;

// ilha flutuante
O('Ilha (grama)', 'cylinder', { rt: 4.2, rb: 4.0, h: 0.4, seg: 48 }, grama, [0, -0.2, 0]);
O('Ilha (terra)', 'cone', { r: 4.0, h: 2.6, seg: 14 }, terra, [0, -1.7, 0], [PI, 0.2, 0]);
O('Pedra solta', 'ico', { r: 0.35, detail: 0 }, pedra, [-3.1, 0.12, -1.9], [0.3, 0.5, 0]);
O('Pedra solta', 'ico', { r: 0.22, detail: 0 }, pedra, [-2.7, 0.07, -2.4], [0.8, 0.1, 0.4]);

// casinha (frente virada para +Z)
const hx = -0.9, hz = -0.3;
O('Alicerce', 'cube', { w: 2.9, h: 0.25, d: 2.5, seg: 1 }, pedra, [hx, 0.125, hz]);
const walls = box(2.6, 2.0, 2.2, 6);
// paredes afinando para cima, levemente barrigudas e tortas: o jeitão "cartoon"
walls.deform((x, y, z) => { const t = (y + 1) / 2, b = 1 + 0.035 * Math.sin(PI * t); return [x * (1 - 0.07 * t) * b + 0.05 * t * t, y, z * (1 - 0.04 * t) * b]; });
O('Paredes', 'custom', walls.geo(), parede, [hx, 1.25, hz]);
const rf = roof(3.15, 1.5, 1.35);
// cumeeira cedendo no meio e beirais virando para cima
rf.deform((x, y, z) => { const s = (2 * x / 3.15) ** 2, t = y / 1.35; return [x + 0.03 * Math.sin(z * 3 + y * 2), y - 0.14 * (1 - s) * t + 0.16 * Math.abs(2 * x / 3.15) ** 3 * (1 - t) + 0.05 * (1 - t) * (Math.abs(z) / 1.5) ** 2, z]; });
O('Telhado', 'custom', rf.geo(), telhado, [hx + 0.05, 2.2, hz]);
O('Chaminé', 'cylinder', { rt: 0.2, rb: 0.26, h: 1.1, seg: 12 }, tijolo, [hx + 0.75, 3.0, hz - 0.5], [0, 0, 0.09]);
O('Topo da chaminé', 'cylinder', { rt: 0.3, rb: 0.27, h: 0.14, seg: 12 }, tijolo, [hx + 0.7, 3.58, hz - 0.5], [0, 0, 0.09]);
O('Fumaça', 'sphere', { r: 0.16, ws: 16, hs: 10 }, fumaca, [hx + 0.72, 3.95, hz - 0.5]);
O('Fumaça', 'sphere', { r: 0.22, ws: 16, hs: 10 }, fumaca, [hx + 0.88, 4.35, hz - 0.45]);
O('Fumaça', 'sphere', { r: 0.28, ws: 16, hs: 10 }, fumaca, [hx + 1.12, 4.85, hz - 0.38]);
const front = hz + 1.1;
O('Porta', 'cube', { w: 0.62, h: 1.0, d: 0.08, seg: 1 }, porta, [hx - 0.45, 0.75, front + 0.03]);
O('Arco da porta', 'cylinder', { rt: 0.31, rb: 0.31, h: 0.08, seg: 24 }, porta, [hx - 0.45, 1.25, front + 0.025], [PI / 2, 0, 0]);
O('Maçaneta', 'sphere', { r: 0.045, ws: 12, hs: 8 }, ouro, [hx - 0.25, 0.78, front + 0.1]);
O('Degrau', 'cube', { w: 0.9, h: 0.16, d: 0.4, seg: 1 }, pedra, [hx - 0.45, 0.08, front + 0.38]);
O('Janela redonda', 'torus', { r: 0.3, tube: 0.06, rs: 12, ts: 32 }, moldura, [hx + 0.6, 1.45, front + 0.03]);
O('Vidro', 'cylinder', { rt: 0.3, rb: 0.3, h: 0.04, seg: 28 }, vidro, [hx + 0.6, 1.45, front + 0.01], [PI / 2, 0, 0]);
O('Travessa', 'cube', { w: 0.6, h: 0.04, d: 0.03, seg: 1 }, moldura, [hx + 0.6, 1.45, front + 0.05]);
O('Travessa', 'cube', { w: 0.04, h: 0.6, d: 0.03, seg: 1 }, moldura, [hx + 0.6, 1.45, front + 0.05]);
O('Floreira', 'cube', { w: 0.72, h: 0.16, d: 0.2, seg: 1 }, madeira, [hx + 0.6, 1.02, front + 0.1]);
[[rosa, -0.24], [amarela, -0.08], [roxa, 0.08], [rosa, 0.24]].forEach(([c, dx], i) =>
  O('Flor', 'sphere', { r: 0.065, ws: 12, hs: 8 }, c, [hx + 0.6 + dx, 1.15 + (i % 2) * 0.03, front + 0.1]));
O('Folhas da floreira', 'sphere', { r: 0.2, ws: 16, hs: 10 }, folha, [hx + 0.6, 1.1, front + 0.1], [0, 0, 0], [1.7, 0.4, 0.6]);
// janela do lado direito (parede +X)
O('Moldura lateral', 'cube', { w: 0.06, h: 0.6, d: 0.6, seg: 1 }, moldura, [hx + 1.27, 1.45, hz]);
O('Vidro lateral', 'cube', { w: 0.04, h: 0.48, d: 0.48, seg: 1 }, vidro, [hx + 1.3, 1.45, hz]);

// quintal
[[-1.25, 1.55], [-0.85, 1.95], [-0.42, 2.3], [0.05, 2.6]].forEach(([x, z], i) =>
  O('Pedra do caminho', 'cylinder', { rt: 0.22 - i * 0.01, rb: 0.24, h: 0.06, seg: 9 }, pedra, [x, 0.03, z], [0, i, 0]));
O('Arbusto', 'sphere', { r: 0.38, ws: 20, hs: 12 }, folha2, [-2.45, 0.3, 0.75]);
O('Arbusto', 'sphere', { r: 0.28, ws: 20, hs: 12 }, folha, [-2.05, 0.22, 1.15]);
O('Tronco', 'cylinder', { rt: 0.15, rb: 0.26, h: 1.7, seg: 10 }, tronco, [2.5, 0.85, -1.6], [0.05, 0, -0.08]);
O('Copa', 'sphere', { r: 0.85, ws: 28, hs: 18 }, folha, [2.55, 2.15, -1.6]);
O('Copa', 'sphere', { r: 0.62, ws: 24, hs: 16 }, folha2, [2.05, 1.85, -1.25]);
O('Copa', 'sphere', { r: 0.56, ws: 24, hs: 16 }, folha, [3.0, 1.95, -1.95]);
O('Poste do correio', 'cube', { w: 0.08, h: 0.85, d: 0.08, seg: 1 }, madeira, [0.75, 0.425, 1.95]);
O('Caixa de correio', 'cube', { w: 0.26, h: 0.2, d: 0.4, seg: 1 }, correio, [0.75, 0.93, 1.95]);
O('Tampa do correio', 'cylinder', { rt: 0.13, rb: 0.13, h: 0.4, seg: 16 }, correio, [0.75, 1.03, 1.95], [PI / 2, 0, 0]);

// ---------- humano esculpido ----------
// Corpo em coordenadas próprias (pés em y = 0, de frente para +Z, ~1,75 m). Todas as partes têm a mesma posição,
// rotação e escala, então dá para mover/girar o humano inteiro mudando só esses valores.
const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a, k) => [a[0] * k, a[1] * k, a[2] * k], dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
};
function builder() {
  const P = [], U = [], I = [], D = [];
  return {
    v(p, u = 0, v = 0, d = null) { P.push(p[0], p[1], p[2]); U.push(u, v); D.push(d); return P.length / 3 - 1; },
    t(a, b, c) { I.push(a, b, c); },
    dir: i => D[i],
    geo() { // só os vértices usados por algum triângulo
      const map = new Map(), NP = [], NU = [], NI = [];
      for (const i of I) { let k = map.get(i); if (k === undefined) { k = NP.length / 3; map.set(i, k); NP.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); NU.push(U[i * 2], U[i * 2 + 1]); } NI.push(k); }
      return { position: NP.map(r4), uv: NU.map(r4), index: NI };
    },
  };
}
// Catmull-Rom nos pontos e nos raios: contorno liso a partir de poucos pontos de controle
function smoothPath(pts, rad, k) {
  const P = [], R = [], n = pts.length;
  const cr = (p0, p1, p2, p3, t) => p1.map((_, i) => 0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t * t + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t * t * t));
  for (let i = 0; i < n - 1; i++) {
    const i0 = Math.max(0, i - 1), i3 = Math.min(n - 1, i + 2);
    for (let s2 = 0; s2 < k; s2++) { const t = s2 / k; P.push(cr(pts[i0], pts[i], pts[i + 1], pts[i3], t)); R.push(cr(rad[i0], rad[i], rad[i + 1], rad[i3], t)); }
  }
  P.push(pts[n - 1]); R.push(rad[n - 1]);
  return [P, R];
}
// tubo de seções elípticas [raio de lado, raio de frente] seguindo o caminho, fechado nas pontas
function loft(pts, rad, { seg = 16, front = [0, 0, 1], k = 5 } = {}) {
  const [P, R] = smoothPath(pts, rad, k), g = builder(), rings = [];
  for (let i = 0; i < P.length; i++) {
    const Tn = V.norm(V.sub(P[Math.min(P.length - 1, i + 1)], P[Math.max(0, i - 1)]));
    const F = V.norm(V.sub(front, V.scale(Tn, V.dot(front, Tn)))), S = V.cross(Tn, F), ring = [];
    for (let j = 0; j < seg; j++) { const a = j / seg * 2 * Math.PI; ring.push(g.v(V.add(P[i], V.add(V.scale(S, Math.cos(a) * R[i][0]), V.scale(F, Math.sin(a) * R[i][1]))), j / seg, i / (P.length - 1))); }
    rings.push(ring);
  }
  for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < seg; j++) {
    const a = rings[i][j], b = rings[i][(j + 1) % seg], c = rings[i + 1][j], d = rings[i + 1][(j + 1) % seg];
    g.t(a, c, d); g.t(a, d, b);
  }
  const cap = (ring, center, end) => { const c = g.v(center, 0.5, end ? 1 : 0); for (let j = 0; j < seg; j++) { const a = ring[j], b = ring[(j + 1) % seg]; if (end) g.t(c, b, a); else g.t(c, a, b); } };
  cap(rings[0], P[0], false); cap(rings[rings.length - 1], P[P.length - 1], true);
  return g.geo();
}
// esfera deformada por fn(dx, dy, dz) -> posição; keep(dx, dy, dz) recorta pedaços (o cabelo usa)
function sculptSphere(fn, ws = 32, hs = 24, keep = null) {
  const g = builder(), rows = [], top = g.v(fn(0, 1, 0), 0.5, 1, [0, 1, 0]), bot = g.v(fn(0, -1, 0), 0.5, 0, [0, -1, 0]);
  for (let j = 1; j < hs; j++) {
    const ph = j / hs * Math.PI, row = [];
    for (let k = 0; k < ws; k++) { const th = k / ws * 2 * Math.PI, d = [Math.sin(ph) * Math.sin(th), Math.cos(ph), Math.sin(ph) * Math.cos(th)]; row.push(g.v(fn(...d), k / ws, 1 - j / hs, d)); }
    rows.push(row);
  }
  const t = (a, b, c) => { if (!keep || [a, b, c].every(i => keep(...g.dir(i)))) g.t(a, b, c); };
  for (let k = 0; k < ws; k++) {
    const k1 = (k + 1) % ws;
    t(top, rows[0][k], rows[0][k1]);
    for (let j = 0; j < rows.length - 1; j++) { const a = rows[j][k], b = rows[j + 1][k], c = rows[j][k1], d = rows[j + 1][k1]; t(a, b, c); t(c, b, d); }
    t(bot, rows[rows.length - 1][k1], rows[rows.length - 1][k]);
  }
  return g.geo();
}
const ellipsoid = (c, r, sc = [1, 1, 1], ws = 16, hs = 12) => sculptSphere((x, y, z) => [c[0] + x * r * sc[0], c[1] + y * r * sc[1], c[2] + z * r * sc[2]], ws, hs);

// rosto: elipsoide com queixo afinando, nariz, arco das sobrancelhas, olhos fundos e maçãs do rosto
const HY = 1.665;
const headFn = (x, y, z) => {
  let X = x * 0.088, Y = y * 0.118, Z = z * 0.102;
  if (y < 0) { const t = -y; X *= 1 - 0.3 * t * t; Z *= 1 - 0.12 * t; }
  if (z < 0 && y > -0.2) Z *= 1.07;
  if (z > 0) {
    Z += 0.03 * z * Math.exp(-((x / 0.12) ** 2 + ((y + 0.06) / 0.2) ** 2));
    Z += 0.007 * z * Math.exp(-(((y - 0.27) / 0.07) ** 2)) * Math.exp(-((x / 0.6) ** 2));
    for (const sx of [-1, 1]) Z -= 0.01 * z * Math.exp(-(((x - 0.36 * sx) / 0.13) ** 2 + ((y - 0.13) / 0.1) ** 2));
    Z += 0.006 * z * Math.exp(-((x / 0.25) ** 2 + ((y + 0.72) / 0.12) ** 2));
    X *= 1 + 0.04 * Math.exp(-(((y + 0.12) / 0.15) ** 2));
  }
  return [X, HY + Y, Z];
};
const onHead = (x, y) => headFn(x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y)));

const bx = 1.55, bz = 1.25, s = 0.78, ry = 0.35;
const H = (name, geo, mat) => O('Humano · ' + name, 'custom', geo, mat, [bx, 0, bz], [0, ry, 0], [s, s, s]);
H('cabeça', sculptSphere(headFn, 40, 30), pele);
for (const sx of [1, -1]) {
  const e = onHead(0.36 * sx, 0.13), lado = sx > 0 ? 'esq.' : 'dir.';
  H('olho ' + lado, ellipsoid([e[0], e[1], e[2] - 0.006], 0.0125, [1, 1, 1], 14, 10), olhoBranco);
  H('íris ' + lado, ellipsoid([e[0], e[1], e[2] + 0.0045], 0.0062, [1, 1, 0.6], 12, 8), iris);
  const b = onHead(0.36 * sx, 0.3), eb = box(0.032, 0.006, 0.008);
  eb.deform((x, y, z) => { const a = -0.12 * sx; return [b[0] + x * Math.cos(a) - y * Math.sin(a), b[1] + 0.004 + x * Math.sin(a) + y * Math.cos(a), b[2] + z + 0.002]; });
  H('sobrancelha ' + lado, eb.geo(), sobrancelha);
  H('orelha ' + lado, ellipsoid([0.088 * sx, HY + 0.005, -0.008], 0.028, [0.38, 1, 0.62], 12, 10), pele);
}
const lip = onHead(0, -0.45);
H('lábios', ellipsoid([0, lip[1], lip[2] - 0.004], 0.022, [1.25, 0.32, 0.55], 16, 10), labio);
H('cabelo', sculptSphere((x, y, z) => [x * 0.094, HY + y * 0.125 + 0.005, z * 0.108 * (z < 0 ? 1.08 : 1) - 0.003], 36, 26,
  (x, y, z) => y > (z >= 0 ? 0.42 * z + 0.05 : 0.05 + 0.6 * z)), cabelo);
H('pescoço', loft([[0, 1.47, -0.012], [0, 1.54, -0.008], [0, 1.6, 0]], [[0.056, 0.054], [0.05, 0.048], [0.048, 0.046]], { seg: 16 }), pele);
H('camisa', loft(
  [[0, 1.03, 0], [0, 1.12, 0.004], [0, 1.22, 0.01], [0, 1.32, 0.016], [0, 1.4, 0.01], [0, 1.45, 0], [0, 1.49, -0.005], [0, 1.515, -0.008]],
  [[0.163, 0.106], [0.157, 0.103], [0.164, 0.109], [0.177, 0.117], [0.183, 0.111], [0.174, 0.098], [0.13, 0.076], [0.055, 0.05]], { seg: 28 }), camisa);
H('quadril', loft([[0, 0.905, 0], [0, 0.95, 0], [0, 1.0, 0], [0, 1.07, 0.002]], [[0.12, 0.075], [0.166, 0.106], [0.172, 0.113], [0.16, 0.104]], { seg: 28 }), jeans);
const armR = [[0.047, 0.045], [0.045, 0.043], [0.036, 0.034], [0.033, 0.031], [0.025, 0.021]];
const sleeveR = [[0.064, 0.06], [0.058, 0.055], [0.054, 0.052]];
// braço esquerdo solto ao lado do corpo
H('braço esq.', loft([[0.172, 1.445, 0], [0.212, 1.32, -0.004], [0.232, 1.17, -0.01], [0.243, 1.04, 0.008], [0.25, 0.905, 0.024]], armR, { seg: 14 }), pele);
H('manga esq.', loft([[0.16, 1.462, 0], [0.205, 1.335, -0.004], [0.222, 1.25, -0.008]], sleeveR, { seg: 18 }), camisa);
H('mão esq.', loft([[0.25, 0.905, 0.024], [0.254, 0.86, 0.028], [0.258, 0.8, 0.03], [0.256, 0.755, 0.028], [0.252, 0.735, 0.026]],
  [[0.019, 0.024], [0.017, 0.034], [0.014, 0.031], [0.011, 0.024], [0.005, 0.012]], { seg: 12 }), pele);
H('polegar esq.', loft([[0.246, 0.875, 0.045], [0.243, 0.845, 0.06], [0.24, 0.82, 0.068]], [[0.012, 0.012], [0.01, 0.01], [0.006, 0.006]], { seg: 10 }), pele);
// braço direito levantado, acenando com a palma para a frente
H('braço dir.', loft([[-0.172, 1.445, 0], [-0.25, 1.51, 0], [-0.33, 1.59, 0.01], [-0.352, 1.71, 0.028], [-0.362, 1.84, 0.04]], armR, { seg: 14 }), pele);
H('manga dir.', loft([[-0.16, 1.462, 0], [-0.24, 1.515, 0], [-0.285, 1.55, 0.004]], sleeveR, { seg: 18 }), camisa);
H('mão dir.', loft([[-0.362, 1.84, 0.04], [-0.364, 1.885, 0.044], [-0.366, 1.94, 0.048], [-0.365, 1.985, 0.048], [-0.364, 2.005, 0.047]],
  [[0.024, 0.019], [0.034, 0.017], [0.031, 0.014], [0.024, 0.011], [0.012, 0.005]], { seg: 12 }), pele);
H('polegar dir.', loft([[-0.338, 1.865, 0.05], [-0.322, 1.895, 0.06], [-0.312, 1.915, 0.064]], [[0.012, 0.012], [0.01, 0.01], [0.006, 0.006]], { seg: 10 }), pele);
for (const sx of [1, -1]) {
  const lado = sx > 0 ? 'esq.' : 'dir.';
  H('perna ' + lado, loft([[0.086 * sx, 0.975, 0], [0.094 * sx, 0.76, 0.006], [0.095 * sx, 0.52, 0.016], [0.093 * sx, 0.3, -0.004], [0.09 * sx, 0.1, -0.01]],
    [[0.085, 0.088], [0.068, 0.07], [0.052, 0.055], [0.05, 0.053], [0.045, 0.047]], { seg: 18 }), jeans);
  H('tênis ' + lado, loft([[0.09 * sx, 0.05, -0.075], [0.09 * sx, 0.06, 0], [0.09 * sx, 0.05, 0.1], [0.092 * sx, 0.035, 0.155], [0.093 * sx, 0.03, 0.17]],
    [[0.04, 0.035], [0.052, 0.055], [0.05, 0.045], [0.038, 0.03], [0.02, 0.015]], { seg: 16, front: [0, 1, 0] }), sapato);
}

const now = Date.now();
const project = {
  v: 1, id: 'casinha_e_boneco', name: 'Casinha e boneco', created: now, updated: now,
  scene: { background: '#79c2ee', grid: false, env: 0.55, sun: 3.4, exposure: 0.92, shadows: true },
  materials: mats, textures: TEX, objects: objs,
  camera: { pos: [5.6, 3.7, 7.6], target: [0.2, 1.45, 0] },
};
fs.writeFileSync(out, JSON.stringify(project));
console.log(`${project.name}: ${objs.length} objetos, ${mats.length} materiais -> ${out} (id ${project.id})`);
