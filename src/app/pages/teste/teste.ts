import { ViewportScroller } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { Dilema, OpcaoDilema } from '../../data/dilema';
import { URL_DILEMAS } from '../../data/dilemas.api';
import {
  RespostaRegistrada,
  ResultadoTeste,
  calcularResultado,
  registrarResposta,
} from '../../data/resultado';
import { ResultadosStore } from '../../data/resultados.store';
import { TesteConclusao } from './conclusao/conclusao';
import { EstadoDilemas, TesteIntro } from './intro/intro';
import { Progresso } from './progresso/progresso';
import { Questao } from './questao/questao';
import { montarTeste } from './teste.logic';

type Etapa = 'intro' | 'questoes' | 'concluido';

@Component({
  selector: 'app-teste',
  imports: [TesteIntro, Progresso, Questao, TesteConclusao],
  templateUrl: './teste.html',
})
export class Teste {
  private readonly store = inject(ResultadosStore);
  private readonly scroller = inject(ViewportScroller);
  private iniciadoEm = new Date();

  /** Banco de dilemas vindo da API (json-server), carregado já na tela inicial. */
  protected readonly dilemas = httpResource<Dilema[]>(() => URL_DILEMAS);
  protected readonly estadoDilemas = computed<EstadoDilemas>(() =>
    this.dilemas.error() ? 'erro' : this.dilemas.hasValue() ? 'pronto' : 'carregando',
  );

  protected readonly etapa = signal<Etapa>('intro');
  protected readonly questoes = signal<Dilema[]>([]);
  protected readonly indice = signal(0);
  protected readonly resultado = signal<ResultadoTeste | null>(null);
  private readonly respostas = signal<RespostaRegistrada[]>([]);

  protected readonly atual = computed(() => this.questoes()[this.indice()]);

  protected iniciar(): void {
    if (this.store.bloqueado() || !this.dilemas.hasValue()) return;
    this.questoes.set(montarTeste(this.dilemas.value()));
    this.indice.set(0);
    this.respostas.set([]);
    this.resultado.set(null);
    this.iniciadoEm = new Date();
    this.irPara('questoes');
  }

  protected responder(opcao: OpcaoDilema): void {
    this.respostas.update((lista) => [...lista, registrarResposta(this.atual(), opcao)]);

    if (this.indice() < this.questoes().length - 1) {
      this.indice.update((i) => i + 1);
      this.scroller.scrollToPosition([0, 0]);
      return;
    }

    const resultado = calcularResultado(this.respostas(), this.iniciadoEm, new Date());
    void this.store.salvar(resultado);
    this.resultado.set(resultado);
    this.irPara('concluido');
  }

  private irPara(etapa: Etapa): void {
    this.etapa.set(etapa);
    this.scroller.scrollToPosition([0, 0]);
  }
}
