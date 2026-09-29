import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Voce Humano',
    loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'leis',
    title: 'As Quatro Leis | Voce Humano',
    loadComponent: () => import('./pages/leis/leis').then((m) => m.Leis),
  },
  {
    path: 'teste',
    title: 'Teste | Voce Humano',
    loadComponent: () => import('./pages/teste/teste').then((m) => m.Teste),
  },
  {
    path: 'humanidade',
    title: 'Humanidade | Voce Humano',
    loadComponent: () => import('./pages/humanidade/humanidade').then((m) => m.Humanidade),
  },
  {
    path: 'dilema/:id',
    title: 'Dilema | Voce Humano',
    loadComponent: () => import('./pages/dilema/dilema').then((m) => m.DilemaVisualizacao),
  },
  {
    path: '**',
    title: 'Página não encontrada | Voce Humano',
    loadComponent: () =>
      import('./pages/nao-encontrado/nao-encontrado').then((m) => m.NaoEncontrado),
  },
];
