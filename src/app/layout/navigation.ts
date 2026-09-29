export interface NavItem {
  label: string;
  path: string;
}

/** Itens do menu principal. Para adicionar uma página, crie a rota em app.routes.ts e inclua aqui. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Iniciar Teste', path: '/teste' },
  { label: 'Tres Leis', path: '/leis' },
  { label: 'Humanidade', path: '/humanidade' },
];
