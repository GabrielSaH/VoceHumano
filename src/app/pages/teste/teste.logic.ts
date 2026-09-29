import { Dilema, NUMEROS_LEI } from '../../data/dilema';

export const QUESTOES_POR_CATEGORIA = 2;

/** Cada lei isolada ("0".."3") e cada confronto entre duas leis ("0-1", "0-2", ...). */
export const CATEGORIAS: readonly string[] = [
  ...NUMEROS_LEI.map(String),
  ...NUMEROS_LEI.flatMap((a) => NUMEROS_LEI.filter((b) => b > a).map((b) => `${a}-${b}`)),
];

export function categoriaDe(dilema: Dilema): string {
  return dilema.leisTestadas.join('-');
}

/** Sorteia 2 dilemas por categoria (20 no total) e embaralha a ordem das questões e das opções. */
export function montarTeste(dilemas: readonly Dilema[], aleatorio = Math.random): Dilema[] {
  const sorteados = CATEGORIAS.flatMap((categoria) => {
    const candidatos = dilemas.filter((d) => categoriaDe(d) === categoria);
    if (candidatos.length < QUESTOES_POR_CATEGORIA) {
      throw new Error(`Dilemas insuficientes na categoria ${categoria}`);
    }
    return embaralhar(candidatos, aleatorio).slice(0, QUESTOES_POR_CATEGORIA);
  });

  return embaralhar(sorteados, aleatorio).map((d) => ({
    ...d,
    opcoes: embaralhar(d.opcoes, aleatorio),
  }));
}

export function embaralhar<T>(itens: readonly T[], aleatorio = Math.random): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
