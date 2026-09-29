import { Component, computed, input } from '@angular/core';

/** Trilha de losangos: preenchidos = respondidos, moldura tracejada = questão atual. */
@Component({
  selector: 'app-progresso',
  templateUrl: './progresso.html',
})
export class Progresso {
  readonly total = input.required<number>();
  /** Índice (base 0) da questão atual. */
  readonly atual = input.required<number>();

  protected readonly passos = computed(() => Array.from({ length: this.total() }, (_, i) => i));
}
