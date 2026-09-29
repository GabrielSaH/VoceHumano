import { Component, input, output, signal } from '@angular/core';
import { Dilema, OpcaoDilema } from '../../../data/dilema';

/**
 * Uma questão do teste. É recriada a cada dilema, então a seleção começa sempre vazia.
 * Em `somenteLeitura`, mostra o dilema e as alternativas sem permitir resposta.
 */
@Component({
  selector: 'app-questao',
  templateUrl: './questao.html',
})
export class Questao {
  readonly dilema = input.required<Dilema>();
  readonly somenteLeitura = input(false);
  readonly respondida = output<OpcaoDilema>();

  protected readonly letras = ['A', 'B', 'C', 'D'];
  protected readonly selecionada = signal<OpcaoDilema | null>(null);

  protected confirmar(): void {
    const opcao = this.selecionada();
    if (opcao) this.respondida.emit(opcao);
  }
}
