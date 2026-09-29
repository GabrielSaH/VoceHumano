// Servidor do registro coletivo (sem dependências).
//   POST /api/resultados      -> registra um teste concluído
//   GET  /api/humanidade      -> estatísticas agregadas
//   GET  /api/dilemas[/:id]   -> repassado ao json-server (npm run api), só leitura
// Em produção também serve o build do Angular (dist/VoceHumano/browser).
import { createServer } from 'node:http';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { agregar, indexarDilemas, montarRegistro } from './registro.mjs';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const ARQUIVO = process.env.VH_DADOS ?? join(RAIZ, 'data', 'resultados.json');
const ESTATICOS = join(RAIZ, '..', 'dist', 'VoceHumano', 'browser');
const PORTA = Number(process.env.PORT ?? 3000);
/** json-server com api/db.json. Fica só na máquina local; o público acessa via este servidor. */
const API_DILEMAS = process.env.VH_API_DILEMAS ?? 'http://localhost:3001';
const LIMITE_CORPO = 32 * 1024;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

// Mesma base servida pelo json-server: usada para validar e recalcular os resultados recebidos.
const dilemasPorId = indexarDilemas(
  JSON.parse(await readFile(join(RAIZ, '..', 'api', 'db.json'), 'utf8')).dilemas,
);
const registros = await carregar();
const ids = new Set(registros.map((r) => r.id));
let gravacao = Promise.resolve();

createServer(async (req, res) => {
  try {
    const { pathname, search } = new URL(req.url ?? '/', 'http://localhost');

    if (pathname === '/api/resultados' && req.method === 'POST') return await receber(req, res);
    if (pathname === '/api/humanidade' && req.method === 'GET') {
      return responder(res, 200, agregar(registros, dilemasPorId));
    }
    if (/^\/api\/dilemas(\/[\w-]+)?$/.test(pathname) && req.method === 'GET') {
      return await repassarDilemas(pathname.slice('/api'.length) + search, res);
    }
    if (pathname.startsWith('/api/')) throw new ErroHttp(404, 'Rota não encontrada');
    if (req.method === 'GET' || req.method === 'HEAD') return await servirEstatico(pathname, res);
    throw new ErroHttp(405, 'Método não permitido');
  } catch (erro) {
    const status = erro instanceof ErroHttp ? erro.status : 500;
    if (status === 500) console.error(erro);
    if (!res.headersSent) responder(res, status, { erro: status === 500 ? 'Erro interno' : erro.message });
  }
}).listen(PORTA, () => {
  console.log(`Registro coletivo em http://localhost:${PORTA} (${registros.length} testes em ${ARQUIVO})`);
});

async function receber(req, res) {
  let corpo;
  try {
    corpo = JSON.parse(await lerCorpo(req));
  } catch (erro) {
    throw erro instanceof ErroHttp ? erro : new ErroHttp(400, 'JSON inválido');
  }

  const registro = montarRegistro(corpo, dilemasPorId);
  if (!registro) throw new ErroHttp(400, 'Resultado inválido');

  // Reenvios do mesmo teste (id gerado no cliente) não contam duas vezes.
  if (ids.has(registro.id)) return responder(res, 200, { ok: true, duplicado: true });

  registros.push(registro);
  ids.add(registro.id);
  await salvar();
  responder(res, 201, { ok: true });
}

/** Repassa leituras ao json-server. Escritas nunca chegam a ele por aqui. */
async function repassarDilemas(caminho, res) {
  let resposta;
  try {
    resposta = await fetch(API_DILEMAS + caminho);
  } catch {
    throw new ErroHttp(502, 'API de dilemas fora do ar. Rode "npm run api".');
  }
  res.writeHead(resposta.status, { 'Content-Type': TIPOS['.json'], 'Cache-Control': 'no-store' });
  res.end(await resposta.text());
}

async function lerCorpo(req) {
  const partes = [];
  let tamanho = 0;
  for await (const parte of req) {
    tamanho += parte.length;
    if (tamanho > LIMITE_CORPO) throw new ErroHttp(413, 'Corpo grande demais');
    partes.push(parte);
  }
  return Buffer.concat(partes).toString('utf8');
}

async function carregar() {
  try {
    return JSON.parse(await readFile(ARQUIVO, 'utf8'));
  } catch (erro) {
    if (erro.code === 'ENOENT') return [];
    throw erro;
  }
}

/** Grava em fila (uma escrita por vez) e de forma atômica (arquivo temporário + rename). */
function salvar() {
  gravacao = gravacao
    .catch(() => {})
    .then(async () => {
      await mkdir(dirname(ARQUIVO), { recursive: true });
      const temporario = `${ARQUIVO}.tmp`;
      await writeFile(temporario, JSON.stringify(registros, null, 2));
      await rename(temporario, ARQUIVO);
    });
  return gravacao;
}

async function servirEstatico(pathname, res) {
  let alvo;
  try {
    alvo = normalize(join(ESTATICOS, decodeURIComponent(pathname)));
  } catch {
    throw new ErroHttp(400, 'Caminho inválido');
  }
  if (alvo !== ESTATICOS && !alvo.startsWith(ESTATICOS + sep)) throw new ErroHttp(403, 'Acesso negado');

  // Rotas do Angular (/teste, /leis...) não são arquivos: devolvem o index.html.
  const info = await stat(alvo).catch(() => null);
  const arquivo = info?.isFile() ? alvo : join(ESTATICOS, 'index.html');

  try {
    const conteudo = await readFile(arquivo);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo)] ?? 'application/octet-stream' });
    res.end(conteudo);
  } catch {
    throw new ErroHttp(404, 'Build não encontrado. Rode "npm run build" antes.');
  }
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': TIPOS['.json'], 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(dados));
}
