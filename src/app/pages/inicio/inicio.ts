import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONFIG } from '../../config';
import { INFO_DIAGNOSTICO } from '../../data/diagnostico';
import { ResultadosStore } from '../../data/resultados.store';

interface Passo {
  numero: string;
  titulo: string;
  texto: string;
  link?: { rotulo: string; caminho: string };
}

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly store = inject(ResultadosStore);

  protected readonly tentativaUnica = CONFIG.tentativaUnica;
  protected readonly bloqueado = this.store.bloqueado;
  protected readonly diagnostico = computed(() => {
    const ultimo = this.store.ultimo();
    return ultimo ? INFO_DIAGNOSTICO[ultimo.diagnostico] : null;
  });

  protected readonly passos: Passo[] = [
    {
      numero: '01',
      titulo: 'Leia as leis',
      texto:
        'Quatro leis, adaptadas de Asimov, definem o que o sistema entende por um ser humano íntegro. A segunda foi reescrita para pessoas.',
      link: { rotulo: 'Abrir as leis', caminho: '/leis' },
    },
    {
      numero: '02',
      titulo: 'Responda aos dilemas',
      texto:
        'São 20 situações sem saída limpa. Marque o que você faria de verdade, não o que parece certo. Depois de confirmar, não dá para voltar.',
    },
    {
      numero: '03',
      titulo: 'Receba o diagnóstico',
      texto:
        'No fim, a máquina classifica você como exemplar, apto ou inapto. O resultado entra, sem identificação, no registro da humanidade.',
      link: { rotulo: 'Ver o registro', caminho: '/humanidade' },
    },
  ];
}
