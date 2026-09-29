import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

/** Página 404: qualquer rota desconhecida cai aqui. */
@Component({
  selector: 'app-nao-encontrado',
  imports: [RouterLink],
  templateUrl: './nao-encontrado.html',
})
export class NaoEncontrado {
  protected readonly endereco = inject(Router).url;
}
