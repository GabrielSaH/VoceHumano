export interface Lei {
  numero: string;
  /** Renderizado em Dune Rise: sem acentos. */
  titulo: string;
  texto: string;
  explicacao: string;
  original: string;
  /** Lei alterada em relação ao texto de Asimov. */
  reescrita?: boolean;
}

export const LEIS: Lei[] = [
  {
    numero: '0',
    titulo: 'LEI ZERO',
    texto:
      'Um ser humano não pode causar mal à humanidade ou, por omissão, permitir que a humanidade sofra algum mal.',
    explicacao:
      'Acima de qualquer indivíduo está a espécie. Pensar no coletivo, nas consequências que atravessam gerações, é o que separa a consciência do instinto. Omitir-se diante do mal comum também é uma escolha.',
    original:
      'Um robô não pode causar mal à humanidade ou, por omissão, permitir que a humanidade sofra algum mal.',
  },
  {
    numero: '1',
    titulo: 'PRIMEIRA LEI',
    texto:
      'Um ser humano não pode ferir outro ser humano ou, por inação, permitir que um ser humano sofra algum mal.',
    explicacao:
      'A empatia em sua forma mais direta: não ferir e não virar o rosto. Assistir ao sofrimento de alguém sem agir, quando se pode agir, é uma forma silenciosa de causar dano.',
    original:
      'Um robô não pode ferir um ser humano ou, por inação, permitir que um ser humano sofra algum mal.',
  },
  {
    numero: '2',
    titulo: 'SEGUNDA LEI',
    texto:
      'Um ser humano tem o direito e a prerrogativa de buscar seus próprios desejos e autodeterminação, desde que essa liberdade de escolha não conflite com as leis anteriores',
    explicacao:
      'O homem foi condenado a ser livre: o fardo e a bênção dessa liberdade terminam exatamente onde a integridade ou a vida de outro ser humano começam a ser ameaçadas',
    original:
      'Um robô deve obedecer às ordens que lhe sejam dadas por seres humanos, exceto nos casos em que tais ordens entrem em conflito com a Primeira Lei.',
    reescrita: true,
  },
  {
    numero: '3',
    titulo: 'TERCEIRA LEI',
    texto:
      'Um ser humano deve proteger sua própria existência, desde que tal proteção não entre em conflito com as leis anteriores.',
    explicacao:
      'Preservar a si mesmo (corpo, mente e dignidade) é legítimo e necessário. Mas a autopreservação vem por último: quem se protege às custas dos outros não é um ser humano exemplar.',
    original:
      'Um robô deve proteger sua própria existência, desde que tal proteção não entre em conflito com a Primeira ou Segunda Leis.',
  },
];
