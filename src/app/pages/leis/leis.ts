import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEIS } from './leis.data';

@Component({
  selector: 'app-leis',
  imports: [RouterLink],
  templateUrl: './leis.html',
})
export class Leis {
  protected readonly leis = LEIS;
}
