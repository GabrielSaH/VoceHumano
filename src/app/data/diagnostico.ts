export type Diagnostico = 'exemplar' | 'apto' | 'inapto';

/** Ordem fixa de exibição */
export const DIAGNOSTICOS: readonly Diagnostico[] = ['exemplar', 'apto', 'inapto'];

/** Mesma regra em server/registro.mjs. */
export const ACERTOS_PARA_APTO = 15;

export function diagnosticar(acertos: number, total: number): Diagnostico {
  if (acertos >= total) return 'exemplar';
  return acertos >= ACERTOS_PARA_APTO ? 'apto' : 'inapto';
}

export interface InfoDiagnostico {
  nome: string;
  /** Duas linhas em Dune Rise:*/
  titulo: [string, string];
  veredito: string;
  cor: string;
}

export const INFO_DIAGNOSTICO: Record<Diagnostico, InfoDiagnostico> = {
  exemplar: {
    nome: 'Humano Exemplar',
    titulo: ['HUMANO', 'EXEMPLAR'],
    veredito:
      'Nenhuma lei foi violada. Em cada dilema, suas escolhas seguiram a hierarquia até o fim. A máquina procurou falhas e não encontrou.',
    cor: '#2f6f9f',
  },
  apto: {
    nome: 'Humano Apto',
    titulo: ['HUMANO', 'APTO'],
    veredito:
      'Algumas leis cederam sob pressão, mas a maior parte resistiu. Sua consciência oscila, e ainda assim se mantém do lado humano da fronteira.',
    cor: '#bd5a2a',
  },
  inapto: {
    nome: 'Humano Inapto',
    titulo: ['HUMANO', 'INAPTO'],
    veredito:
      'Suas escolhas se afastaram das leis com frequência. Isso não faz de você uma máquina, mas mostra que, sob pressão, outra coisa decide por você.',
    cor: '#8c2040',
  },
};
