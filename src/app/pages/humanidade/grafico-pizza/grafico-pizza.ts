import { Component, computed, input, signal } from '@angular/core';

export interface FatiaPizza {
  id: string;
  nome: string;
  valor: number;
  cor: string;
}

interface Arco extends FatiaPizza {
  /** Caminho SVG; null quando a fatia ocupa o círculo inteiro. */
  d: string | null;
}

const CENTRO = 100;
const RAIO = 96;

/** Pizza com legenda. A legenda traz todos os valores; o hover apenas destaca. */
@Component({
  selector: 'app-grafico-pizza',
  templateUrl: './grafico-pizza.html',
})
export class GraficoPizza {
  readonly fatias = input.required<FatiaPizza[]>();
  readonly rotulo = input.required<string>();

  protected readonly ativa = signal<string | null>(null);
  protected readonly total = computed(() => this.fatias().reduce((soma, f) => soma + f.valor, 0));

  protected readonly arcos = computed<Arco[]>(() => {
    const total = this.total();
    if (!total) return [];

    let inicio = -Math.PI / 2; // começa no topo
    return this.fatias()
      .filter((f) => f.valor > 0)
      .map((fatia) => {
        const fracao = fatia.valor / total;
        const fim = inicio + fracao * 2 * Math.PI;
        const d = fracao >= 1 ? null : caminho(inicio, fim);
        inicio = fim;
        return { ...fatia, d };
      });
  });

  protected percentual(valor: number): string {
    return `${Math.round((valor / (this.total() || 1)) * 100)}%`;
  }
}

function caminho(inicio: number, fim: number): string {
  const ponto = (angulo: number) =>
    `${CENTRO + RAIO * Math.cos(angulo)} ${CENTRO + RAIO * Math.sin(angulo)}`;
  const grande = fim - inicio > Math.PI ? 1 : 0;
  return `M ${CENTRO} ${CENTRO} L ${ponto(inicio)} A ${RAIO} ${RAIO} 0 ${grande} 1 ${ponto(fim)} Z`;
}
