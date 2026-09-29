import { HttpErrorResponse } from '@angular/common/http';
import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { CONFIG } from '../config';
import { diagnosticar } from './diagnostico';
import { HumanidadeApi } from './humanidade.api';
import { ResultadoTeste } from './resultado';

const CHAVE = 'voce-humano:resultados';
const CHAVE_PENDENTES = 'voce-humano:envios-pendentes';

export type EstadoEnvio = 'ocioso' | 'enviando' | 'enviado' | 'pendente';

/**
 * Histórico de aplicações do teste, salvo no navegador (mais recente primeiro),
 * e envio ao registro coletivo. Envios que falham ficam na fila e são reenviados depois.
 */
@Injectable({ providedIn: 'root' })
export class ResultadosStore {
  private readonly document = inject(DOCUMENT);
  private readonly api = inject(HumanidadeApi);
  private readonly lista = signal<ResultadoTeste[]>(ler(CHAVE, []).map(migrar));
  private fila = Promise.resolve();

  readonly historico = this.lista.asReadonly();
  readonly ultimo = computed(() => this.lista()[0] ?? null);
  /** Com CONFIG.tentativaUnica, quem já concluiu o teste não pode fazê-lo de novo. */
  readonly bloqueado = computed(() => CONFIG.tentativaUnica && this.ultimo() !== null);
  /** Situação do envio do último resultado salvo. */
  readonly envio = signal<EstadoEnvio>('ocioso');

  constructor() {
    void this.enviarPendentes();
  }

  async salvar(resultado: ResultadoTeste): Promise<void> {
    this.lista.update((lista) => [resultado, ...lista]);
    gravar(CHAVE, this.lista());
    gravar(CHAVE_PENDENTES, [...ler<string[]>(CHAVE_PENDENTES, []), resultado.id]);

    this.envio.set('enviando');
    await this.enviarPendentes();
    this.envio.set(ler<string[]>(CHAVE_PENDENTES, []).includes(resultado.id) ? 'pendente' : 'enviado');
  }

  /** Baixa o resultado como arquivo JSON. */
  exportar(resultado: ResultadoTeste): void {
    const blob = new Blob([JSON.stringify(resultado, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = `voce-humano-${resultado.concluidoEm.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Um reenvio por vez; o servidor ignora ids repetidos, então repetir é seguro. */
  private enviarPendentes(): Promise<void> {
    this.fila = this.fila.then(async () => {
      for (const id of ler<string[]>(CHAVE_PENDENTES, [])) {
        const resultado = this.lista().find((r) => r.id === id);
        try {
          if (resultado) await this.api.enviar(resultado);
          remover(id);
        } catch (erro) {
          // 400: o servidor recusou o conteúdo e nunca vai aceitar; não adianta tentar de novo.
          if (erro instanceof HttpErrorResponse && erro.status === 400) remover(id);
          else return; // sem conexão ou servidor fora do ar: tenta na próxima oportunidade
        }
      }
    });
    return this.fila;
  }
}

function remover(id: string): void {
  gravar(
    CHAVE_PENDENTES,
    ler<string[]>(CHAVE_PENDENTES, []).filter((pendente) => pendente !== id),
  );
}

/** Resultados da versão 1 não tinham diagnóstico. */
function migrar(resultado: ResultadoTeste): ResultadoTeste {
  return resultado.diagnostico
    ? resultado
    : { ...resultado, diagnostico: diagnosticar(resultado.acertos, resultado.totalQuestoes) };
}

function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Armazenamento indisponível (modo privado, cota cheia): os dados seguem em memória.
  }
}
