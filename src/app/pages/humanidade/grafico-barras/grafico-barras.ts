import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BarraGrafico {
  id: string;
  rotulo: string;
  /** Fração entre 0 e 1. */
  valor: number;
  /** Texto exibido na ponta da barra (ex.: "42%"). */
  rotuloValor: string;
  /** Contexto sempre visível abaixo da barra (ex.: "12 de 30 avaliados"). */
  detalhe: string;
  /** Com ao menos um destaque, as demais barras ficam em cinza (ênfase). */
  destaque?: boolean;
  /** Rota aberta ao clicar na barra. */
  link?: string;
}

const COR_BARRA = '#b04a26';
const COR_SECUNDARIA = '#c9bfb4';

/** Barras horizontais de uma série. Todos os valores ficam visíveis; o hover só realça. */
@Component({
  selector: 'app-grafico-barras',
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './grafico-barras.html',
})
export class GraficoBarras {
  readonly barras = input.required<BarraGrafico[]>();
  /**
   * "absoluta": o comprimento é a fração de 0 a 100%, com trilho ao fundo.
   * "relativa": a maior barra ocupa a largura toda (para comparar parcelas próximas).
   */
  readonly escala = input<'absoluta' | 'relativa'>('absoluta');

  private readonly maximo = computed(() => Math.max(...this.barras().map((b) => b.valor), 0));
  private readonly temDestaque = computed(() => this.barras().some((b) => b.destaque));

  protected largura(barra: BarraGrafico): number {
    const base = this.escala() === 'relativa' ? this.maximo() : 1;
    return base ? (barra.valor / base) * 100 : 0;
  }

  protected cor(barra: BarraGrafico): string {
    return this.temDestaque() && !barra.destaque ? COR_SECUNDARIA : COR_BARRA;
  }
}
