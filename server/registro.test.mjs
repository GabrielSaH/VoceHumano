import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { TOTAL_QUESTOES, agregar, diagnosticar, indexarDilemas, montarRegistro } from './registro.mjs';

const { dilemas } = JSON.parse(await readFile(new URL('../api/db.json', import.meta.url), 'utf8'));
const porId = indexarDilemas(dilemas);

/** Monta um envio com os 20 primeiros dilemas, errando os `erros` primeiros. */
function envio(erros = 0, id = 'teste-0001') {
  return {
    id,
    concluidoEm: '2026-09-29T12:00:00.000Z',
    respostas: dilemas.slice(0, TOTAL_QUESTOES).map((d, i) => ({
      dilemaId: d.id,
      opcaoId: d.opcoes.find((o) => o.correta === i >= erros).id,
    })),
  };
}

test('diagnóstico segue os limites 20 / 15', () => {
  assert.equal(diagnosticar(20, 20), 'exemplar');
  assert.equal(diagnosticar(15, 20), 'apto');
  assert.equal(diagnosticar(14, 20), 'inapto');
});

test('recalcula acertos e leis a partir das opções, ignorando o que o cliente afirma', () => {
  const registro = montarRegistro({ ...envio(3), acertos: 20, diagnostico: 'exemplar' }, porId);
  assert.equal(registro.acertos, 17);
  assert.equal(registro.diagnostico, 'apto');
  assert.equal(registro.respostas.filter((r) => !r.correta).length, 3);
});

test('rejeita envios inválidos', () => {
  const base = envio();
  assert.equal(montarRegistro(null, porId), null);
  assert.equal(montarRegistro({ ...base, id: 'x' }, porId), null);
  assert.equal(montarRegistro({ ...base, respostas: base.respostas.slice(1) }, porId), null);
  const repetido = base.respostas.map((r, i) => (i === 1 ? base.respostas[0] : r));
  assert.equal(montarRegistro({ ...base, respostas: repetido }, porId), null, 'dilema repetido');
  const opcaoInexistente = base.respostas.map((r, i) => (i === 0 ? { ...r, opcaoId: 'z' } : r));
  assert.equal(montarRegistro({ ...base, respostas: opcaoInexistente }, porId), null);
});

test('agrega diagnósticos, taxa de acerto e erros por dilema', () => {
  const registros = [montarRegistro(envio(0, 'aaaa-0001'), porId), montarRegistro(envio(10, 'aaaa-0002'), porId)];
  const dados = agregar(registros, porId);

  assert.equal(dados.total, 2);
  assert.deepEqual(dados.diagnosticos, { exemplar: 1, apto: 0, inapto: 1 });
  assert.equal(dados.taxaAcerto, 30 / 40);
  assert.deepEqual(dados.dilemas.find((d) => d.id === dilemas[0].id), {
    id: dilemas[0].id,
    titulo: dilemas[0].titulo,
    aparicoes: 2,
    erros: 1,
  });
});
