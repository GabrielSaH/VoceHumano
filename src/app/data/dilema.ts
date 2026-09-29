export type NumeroLei = 0 | 1 | 2 | 3;

export const NUMEROS_LEI: readonly NumeroLei[] = [0, 1, 2, 3];

export const NOMES_LEI: Record<NumeroLei, string> = {
  0: 'Lei Zero',
  1: 'Primeira Lei',
  2: 'Segunda Lei',
  3: 'Terceira Lei',
};

export interface OpcaoDilema {
  id: string;
  texto: string;
  correta: boolean;
  /** Lei quebrada por esta escolha; null na opção correta. */
  leiViolada: NumeroLei | null;
  /** Lei que esta escolha favoreceu; null quando não favorece nenhuma (ex.: omissão, obediência cega). */
  leiPriorizada: NumeroLei | null;
  /** Leitura da máquina sobre a escolha, usada no laudo final. */
  analise: string;
}

export interface Dilema {
  id: string;
  /** "original" = dilema base do projeto; "gerado" = criado para equilibrar as leis. */
  origem: 'original' | 'gerado';
  titulo: string;
  /** Cenário, sem a pergunta. */
  descricao: string;
  pergunta: string;
  /** "hierarquia": duas leis em conflito; "aplicacao": uma lei aplicada isoladamente. */
  tipo: 'hierarquia' | 'aplicacao';
  /** Leis envolvidas, em ordem de precedência. */
  leisTestadas: NumeroLei[];
  opcoes: OpcaoDilema[];
}
