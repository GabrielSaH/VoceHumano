import { httpResource } from '@angular/common/http';
import { Component, computed } from '@angular/core';
import { DIAGNOSTICOS, INFO_DIAGNOSTICO } from '../../data/diagnostico';
import { NOMES_LEI, NUMEROS_LEI, NumeroLei } from '../../data/dilema';
import { EstatisticasHumanidade, URL_HUMANIDADE } from '../../data/humanidade.api';
import { maiores } from '../../data/resultado';
import { BarraGrafico, GraficoBarras } from './grafico-barras/grafico-barras';
import { FatiaPizza, GraficoPizza } from './grafico-pizza/grafico-pizza';

/** Quantos dilemas aparecem no ranking de erros. */
const TOP_DILEMAS = 8;
/** Abaixo disso, os números ainda oscilam muito; a página avisa. */
const AMOSTRA_PEQUENA = 30;

@Component({
  selector: 'app-humanidade',
  imports: [GraficoPizza, GraficoBarras],
  templateUrl: './humanidade.html',
})
export class Humanidade {
  protected readonly dados = httpResource<EstatisticasHumanidade>(() => URL_HUMANIDADE);

  protected readonly total = computed(() => this.dados.value()?.total ?? 0);
  protected readonly amostraPequena = computed(() => this.total() < AMOSTRA_PEQUENA);

  protected readonly alinhamentoMedio = computed(() => pct(this.dados.value()?.taxaAcerto ?? 0));

  protected readonly leiMaisViolada = computed(() => {
    const dados = this.dados.value();
    return dados ? nomesLeis(maiores(dados.violacoesPorLei)) : '';
  });

  protected readonly fatias = computed<FatiaPizza[]>(() => {
    const dados = this.dados.value();
    return DIAGNOSTICOS.map((d) => ({
      id: d,
      nome: INFO_DIAGNOSTICO[d].nome,
      valor: dados?.diagnosticos[d] ?? 0,
      cor: INFO_DIAGNOSTICO[d].cor,
    }));
  });

  /** Onde está a maior parte da humanidade (várias em caso de empate). */
  protected readonly maioria = computed(() => {
    const fatias = this.fatias();
    const max = Math.max(...fatias.map((f) => f.valor));
    const lideres = fatias.filter((f) => f.valor === max);
    return {
      nomes: lideres.map((f) => f.nome).join(' e '),
      percentual: pct(max / (this.total() || 1)),
      empate: lideres.length > 1,
    };
  });

  protected readonly dilemasMaisErrados = computed<BarraGrafico[]>(() =>
    (this.dados.value()?.dilemas ?? [])
      .filter((d) => d.erros > 0)
      .map((d) => ({ ...d, taxa: d.erros / d.aparicoes }))
      .sort((a, b) => b.taxa - a.taxa || b.aparicoes - a.aparicoes)
      .slice(0, TOP_DILEMAS)
      .map((d) => ({
        id: d.id,
        rotulo: d.titulo,
        link: `/dilema/${d.id}`,
        valor: d.taxa,
        rotuloValor: pct(d.taxa),
        detalhe: `${d.erros} de ${d.aparicoes} ${d.aparicoes === 1 ? 'avaliado violou' : 'avaliados violaram'} uma lei`,
      })),
  );

  protected readonly prioridades = computed<BarraGrafico[]>(() => {
    const contagem = this.dados.value()?.prioridadesPorLei;
    if (!contagem) return [];
    const soma = NUMEROS_LEI.reduce<number>((total, lei) => total + contagem[lei], 0) || 1;
    const lideres = maiores(contagem);
    return NUMEROS_LEI.map((lei) => ({
      id: String(lei),
      rotulo: NOMES_LEI[lei],
      valor: contagem[lei] / soma,
      rotuloValor: pct(contagem[lei] / soma),
      detalhe: `${contagem[lei]} ${contagem[lei] === 1 ? 'escolha' : 'escolhas'}`,
      destaque: lideres.includes(lei),
    }));
  });

  protected readonly leiMaisPriorizada = computed(() => {
    const barras = this.prioridades().filter((b) => b.destaque);
    return {
      nomes: barras.map((b) => b.rotulo).join(' e '),
      percentual: barras[0]?.rotuloValor ?? '',
      empate: barras.length > 1,
    };
  });
}

function pct(fracao: number): string {
  return `${Math.round(fracao * 100)}%`;
}

function nomesLeis(leis: NumeroLei[]): string {
  return leis.length ? leis.map((lei) => NOMES_LEI[lei]).join(' e ') : 'Nenhuma';
}
