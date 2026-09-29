import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { INFO_DIAGNOSTICO } from '../../data/diagnostico';
import { ResultadosStore } from '../../data/resultados.store';
import { NavItem } from '../navigation';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  host: { class: 'sticky top-0 z-50 block' },
})
export class Header {
  readonly items = input.required<NavItem[]>();

  protected readonly menuOpen = signal(false);

  /** Diagnóstico do último teste deste navegador; null enquanto não houver. */
  private readonly ultimo = inject(ResultadosStore).ultimo;
  protected readonly diagnostico = computed(() => {
    const ultimo = this.ultimo();
    return ultimo ? INFO_DIAGNOSTICO[ultimo.diagnostico] : null;
  });

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
