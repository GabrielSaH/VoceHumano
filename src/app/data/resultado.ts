import { Diagnostico, diagnosticar } from './diagnostico';
import { Dilema, NUMEROS_LEI, NumeroLei, OpcaoDilema } from './dilema';

export type ContagemPorLei = Record<NumeroLei, number>;

export interface RespostaRegistrada {
  dilemaId: string;
  titulo: string;
  leisTestadas: NumeroLei[];
  opcaoId: string;
  opcaoTexto: string;
  correta: boolean;
  leiViolada: NumeroLei | null;
  leiPriorizada: NumeroLei | null;
}

export interface ResultadoTeste {
  versao: 2;
  id: string;
  iniciadoEm: string;
  concluidoEm: string;
  totalQuestoes: number;
  acertos: number;
  diagnostico: Diagnostico;
  violacoesPorLei: ContagemPorLei;
  prioridadesPorLei: ContagemPorLei;
  leisMaisVioladas: NumeroLei[]; // de 0 a 2 elementos
  leisMaisPriorizadas: NumeroLei[];
  respostas: RespostaRegistrada[];
}

export function registrarResposta(dilema: Dilema, opcao: OpcaoDilema): RespostaRegistrada {
  return {
    dilemaId: dilema.id,
    titulo: dilema.titulo,
    leisTestadas: dilema.leisTestadas,
    opcaoId: opcao.id,
    opcaoTexto: opcao.texto,
    correta: opcao.correta,
    leiViolada: opcao.leiViolada,
    leiPriorizada: opcao.leiPriorizada,
  };
}

export function calcularResultado(
  respostas: RespostaRegistrada[],
  iniciadoEm: Date,
  concluidoEm: Date,
): ResultadoTeste {
  const violacoesPorLei = contar(respostas.map((r) => r.leiViolada));
  const prioridadesPorLei = contar(respostas.map((r) => r.leiPriorizada));
  const acertos = respostas.filter((r) => r.correta).length;

  return {
    versao: 2,
    id: gerarId(),
    iniciadoEm: iniciadoEm.toISOString(),
    concluidoEm: concluidoEm.toISOString(),
    totalQuestoes: respostas.length,
    acertos,
    diagnostico: diagnosticar(acertos, respostas.length),
    violacoesPorLei,
    prioridadesPorLei,
    leisMaisVioladas: maiores(violacoesPorLei),
    leisMaisPriorizadas: maiores(prioridadesPorLei),
    respostas,
  };
}

function contar(leis: (NumeroLei | null)[]): ContagemPorLei {
  const contagem: ContagemPorLei = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const lei of leis) {
    if (lei !== null) contagem[lei]++;
  }
  return contagem;
}

export function maiores(contagem: ContagemPorLei): NumeroLei[] {
  const max = Math.max(...NUMEROS_LEI.map((lei) => contagem[lei]));
  return max === 0 ? [] : NUMEROS_LEI.filter((lei) => contagem[lei] === max);
}

function gerarId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
