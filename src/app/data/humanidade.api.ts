import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Diagnostico } from './diagnostico';
import { ContagemPorLei, ResultadoTeste } from './resultado';

export const URL_HUMANIDADE = '/api/humanidade';
const URL_RESULTADOS = '/api/resultados';

/** Resposta de GET /api/humanidade (ver server/registro.mjs → agregar). */
export interface EstatisticasHumanidade {
  total: number;
  taxaAcerto: number; // de 0 a 1
  diagnosticos: Record<Diagnostico, number>;
  violacoesPorLei: ContagemPorLei;
  prioridadesPorLei: ContagemPorLei;
  dilemas: { id: string; titulo: string; aparicoes: number; erros: number }[];
}

@Injectable({ providedIn: 'root' })
export class HumanidadeApi {
  private readonly http = inject(HttpClient);

  /** Envia só o necessário; o servidor recalcula acertos, leis e diagnóstico. */
  enviar(resultado: ResultadoTeste): Promise<unknown> {
    return firstValueFrom(
      this.http.post(URL_RESULTADOS, {
        id: resultado.id,
        concluidoEm: resultado.concluidoEm,
        respostas: resultado.respostas.map((r) => ({ dilemaId: r.dilemaId, opcaoId: r.opcaoId })),
      }),
    );
  }
}
