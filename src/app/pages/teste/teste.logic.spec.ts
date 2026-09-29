import db from '../../../../api/db.json';
import { Dilema, NUMEROS_LEI } from '../../data/dilema';
import { calcularResultado, registrarResposta } from '../../data/resultado';
import { CATEGORIAS, categoriaDe, montarTeste } from './teste.logic';

/** Mesma base que o json-server serve em /dilemas. */
const DILEMAS = db.dilemas as Dilema[];

describe('api/db.json', () => {
  it('tem ids únicos', () => {
    const ids = DILEMAS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tem ao menos 6 dilemas em cada categoria', () => {
    for (const categoria of CATEGORIAS) {
      expect(DILEMAS.filter((d) => categoriaDe(d) === categoria).length, categoria).toBeGreaterThanOrEqual(6);
    }
  });

  it('tem uma opção correta por dilema e leis coerentes em cada opção', () => {
    for (const d of DILEMAS) {
      expect(d.opcoes.filter((o) => o.correta).length, d.id).toBe(1);
      for (const o of d.opcoes) {
        expect(o.correta, `${d.id}/${o.id}`).toBe(o.leiViolada === null);
        if (o.leiViolada !== null) expect(d.leisTestadas, d.id).toContain(o.leiViolada);
        if (o.leiPriorizada !== null) expect(d.leisTestadas, d.id).toContain(o.leiPriorizada);
        if (o.correta) expect(o.leiPriorizada, d.id).not.toBeNull();
      }
    }
  });
});

describe('montarTeste', () => {
  it('sorteia 20 dilemas distintos, 2 por categoria, com cada lei em 8 questões', () => {
    const teste = montarTeste(DILEMAS);

    expect(teste.length).toBe(20);
    expect(new Set(teste.map((d) => d.id)).size).toBe(20);
    for (const categoria of CATEGORIAS) {
      expect(teste.filter((d) => categoriaDe(d) === categoria).length, categoria).toBe(2);
    }
    for (const lei of NUMEROS_LEI) {
      expect(teste.filter((d) => d.leisTestadas.includes(lei)).length).toBe(8);
    }
  });
});

describe('calcularResultado', () => {
  it('conta acertos, violações e prioridades, mantendo empates', () => {
    const [a, b, c] = DILEMAS.filter((d) => categoriaDe(d) === '0-1');
    const certa = (d: typeof a) => d.opcoes.find((o) => o.correta)!;
    const errada = (d: typeof a) => d.opcoes.find((o) => !o.correta)!;

    const resultado = calcularResultado(
      [registrarResposta(a, certa(a)), registrarResposta(b, errada(b)), registrarResposta(c, certa(c))],
      new Date('2026-01-01T10:00:00Z'),
      new Date('2026-01-01T10:10:00Z'),
    );

    expect(resultado.totalQuestoes).toBe(3);
    expect(resultado.acertos).toBe(2);
    expect(resultado.violacoesPorLei).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0 });
    expect(resultado.prioridadesPorLei).toEqual({ 0: 2, 1: 1, 2: 0, 3: 0 });
    expect(resultado.leisMaisVioladas).toEqual([0]);
    expect(resultado.leisMaisPriorizadas).toEqual([0]);
  });

  it('não aponta lei mais violada quando não houve violação', () => {
    const d = DILEMAS[0];
    const resultado = calcularResultado(
      [registrarResposta(d, d.opcoes.find((o) => o.correta)!)],
      new Date(),
      new Date(),
    );
    expect(resultado.leisMaisVioladas).toEqual([]);
  });
});
