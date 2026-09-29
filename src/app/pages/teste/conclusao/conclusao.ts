import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { INFO_DIAGNOSTICO } from '../../../data/diagnostico';
import { NOMES_LEI, NumeroLei } from '../../../data/dilema';
import { ResultadoTeste } from '../../../data/resultado';
import { ResultadosStore } from '../../../data/resultados.store';

@Component({
  selector: 'app-teste-conclusao',
  imports: [RouterLink],
  templateUrl: './conclusao.html',
})
export class TesteConclusao {
  private readonly store = inject(ResultadosStore);

  readonly resultado = input.required<ResultadoTeste>();
  readonly refazer = output<void>();

  protected readonly envio = this.store.envio;
  protected readonly bloqueado = this.store.bloqueado;
  protected readonly diagnostico = computed(() => INFO_DIAGNOSTICO[this.resultado().diagnostico]);
  protected readonly maisViolada = computed(() => nomes(this.resultado().leisMaisVioladas));
  protected readonly maisPriorizada = computed(() => nomes(this.resultado().leisMaisPriorizadas));

  protected exportar(): void {
    this.store.exportar(this.resultado());
  }
}

function nomes(leis: NumeroLei[]): string {
  return leis.length ? leis.map((lei) => NOMES_LEI[lei]).join(' e ') : 'Nenhuma';
}
