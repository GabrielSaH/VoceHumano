import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { INFO_DIAGNOSTICO } from '../../../data/diagnostico';
import { ResultadoTeste } from '../../../data/resultado';
import { ResultadosStore } from '../../../data/resultados.store';

export type EstadoDilemas = 'carregando' | 'pronto' | 'erro';

/** Termos que precisam ser aceitos antes de iniciar. Cada um vira um controle do formulário. */
const TERMOS = [
  { id: 'humano', texto: 'Marque esta caixa apenas se você for um ser humano.' },
  {
    id: 'sinceridade',
    texto:
      'Comprometo-me a não buscar a resposta correta, e sim a que mais se aproxima do que eu faria se a situação descrita fosse real.',
  },
];

@Component({
  selector: 'app-teste-intro',
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  templateUrl: './intro.html',
})
export class TesteIntro {
  /** Situação da carga dos dilemas pela API; o teste só inicia com eles prontos. */
  readonly estadoDilemas = input.required<EstadoDilemas>();
  readonly iniciar = output<void>();
  readonly recarregar = output<void>();

  private readonly store = inject(ResultadosStore);
  protected readonly ultimo = this.store.ultimo;
  protected readonly bloqueado = this.store.bloqueado;

  protected readonly termos = TERMOS;
  protected readonly form = new FormGroup(
    Object.fromEntries(
      TERMOS.map((termo) => [
        termo.id,
        new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
      ]),
    ),
  );

  protected readonly formValido = toSignal(
    this.form.statusChanges.pipe(map((status) => status === 'VALID')),
    { initialValue: this.form.valid },
  );
  protected readonly podeIniciar = computed(
    () => this.formValido() && this.estadoDilemas() === 'pronto',
  );

  protected enviar(): void {
    if (!this.podeIniciar()) {
      this.form.markAllAsTouched();
      return;
    }
    this.iniciar.emit();
  }

  protected nomeDiagnostico(resultado: ResultadoTeste): string {
    return INFO_DIAGNOSTICO[resultado.diagnostico].nome;
  }
}
