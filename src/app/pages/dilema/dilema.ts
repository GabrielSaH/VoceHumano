import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Dilema } from '../../data/dilema';
import { urlDilema } from '../../data/dilemas.api';
import { ResultadosStore } from '../../data/resultados.store';
import { Questao } from '../teste/questao/questao';

/** Visualização de um dilema pelo link /dilema/:id. Não permite responder. */
@Component({
  selector: 'app-dilema',
  imports: [RouterLink, Questao],
  templateUrl: './dilema.html',
})
export class DilemaVisualizacao {
  /** Vem do parâmetro :id da rota (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly dilema = httpResource<Dilema>(() => urlDilema(this.id()));
  protected readonly naoEncontrado = computed(() => {
    const erro = this.dilema.error();
    return erro instanceof HttpErrorResponse && erro.status === 404;
  });
  protected readonly bloqueado = inject(ResultadosStore).bloqueado;

  constructor() {
    const titulo = inject(Title);
    effect(() => {
      if (this.dilema.hasValue()) titulo.setTitle(`${this.dilema.value().titulo} | Voce Humano`);
    });
  }
}
