// Regras puras do registro coletivo: validação do envio, montagem do registro e agregação.
// O servidor não confia no cliente: acertos, leis e diagnóstico são recalculados a partir
// das opções escolhidas, consultando o próprio dilemas.json.

const LEIS = [0, 1, 2, 3];

/** Mesmo total de src/app/pages/teste/teste.logic.ts (10 categorias × 2 questões). */
export const TOTAL_QUESTOES = 20;

/** Mesma regra de src/app/data/diagnostico.ts. */
export const ACERTOS_PARA_APTO = 15;

export function diagnosticar(acertos, total) {
  if (acertos >= total) return 'exemplar';
  return acertos >= ACERTOS_PARA_APTO ? 'apto' : 'inapto';
}

export function indexarDilemas(dilemas) {
  return new Map(dilemas.map((d) => [d.id, d]));
}

/**
 * Converte o corpo recebido em um registro confiável, ou retorna null se for inválido.
 * Corpo esperado: { id, concluidoEm, respostas: [{ dilemaId, opcaoId }] }.
 */
export function montarRegistro(corpo, dilemasPorId, recebidoEm = new Date()) {
  if (!corpo || typeof corpo !== 'object') return null;

  const { id, concluidoEm, respostas } = corpo;
  if (typeof id !== 'string' || !/^[\w-]{8,64}$/.test(id)) return null;
  if (typeof concluidoEm !== 'string' || Number.isNaN(Date.parse(concluidoEm))) return null;
  if (!Array.isArray(respostas) || respostas.length !== TOTAL_QUESTOES) return null;

  const vistos = new Set();
  const itens = [];
  for (const resposta of respostas) {
    const dilema = typeof resposta?.dilemaId === 'string' ? dilemasPorId.get(resposta.dilemaId) : undefined;
    const opcao = dilema?.opcoes.find((o) => o.id === resposta.opcaoId);
    if (!opcao || vistos.has(dilema.id)) return null;

    vistos.add(dilema.id);
    itens.push({
      dilemaId: dilema.id,
      opcaoId: opcao.id,
      correta: opcao.correta,
      leiViolada: opcao.leiViolada,
      leiPriorizada: opcao.leiPriorizada,
    });
  }

  const acertos = itens.filter((r) => r.correta).length;
  const violacoesPorLei = contar(itens.map((r) => r.leiViolada));
  const prioridadesPorLei = contar(itens.map((r) => r.leiPriorizada));

  return {
    id,
    recebidoEm: recebidoEm.toISOString(),
    concluidoEm: new Date(concluidoEm).toISOString(),
    diagnostico: diagnosticar(acertos, itens.length),
    acertos,
    totalQuestoes: itens.length,
    violacoesPorLei,
    prioridadesPorLei,
    leisMaisVioladas: maiores(violacoesPorLei),
    leisMaisPriorizadas: maiores(prioridadesPorLei),
    respostas: itens,
  };
}

/** Estatísticas públicas da página Humanidade. Não expõe registros individuais. */
export function agregar(registros, dilemasPorId = new Map()) {
  const diagnosticos = { exemplar: 0, apto: 0, inapto: 0 };
  const violacoesPorLei = contar([]);
  const prioridadesPorLei = contar([]);
  const porDilema = new Map();
  let acertos = 0;
  let questoes = 0;

  for (const registro of registros) {
    diagnosticos[registro.diagnostico]++;
    acertos += registro.acertos;
    questoes += registro.totalQuestoes;
    for (const lei of LEIS) {
      violacoesPorLei[lei] += registro.violacoesPorLei[lei];
      prioridadesPorLei[lei] += registro.prioridadesPorLei[lei];
    }
    for (const resposta of registro.respostas) {
      const dilema = porDilema.get(resposta.dilemaId) ?? {
        id: resposta.dilemaId,
        titulo: dilemasPorId.get(resposta.dilemaId)?.titulo ?? resposta.dilemaId,
        aparicoes: 0,
        erros: 0,
      };
      dilema.aparicoes++;
      if (!resposta.correta) dilema.erros++;
      porDilema.set(resposta.dilemaId, dilema);
    }
  }

  return {
    total: registros.length,
    taxaAcerto: questoes ? acertos / questoes : 0,
    diagnosticos,
    violacoesPorLei,
    prioridadesPorLei,
    dilemas: [...porDilema.values()],
  };
}

function contar(leis) {
  const contagem = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const lei of leis) {
    if (lei !== null) contagem[lei]++;
  }
  return contagem;
}

function maiores(contagem) {
  const max = Math.max(...LEIS.map((lei) => contagem[lei]));
  return max === 0 ? [] : LEIS.filter((lei) => contagem[lei] === max);
}
