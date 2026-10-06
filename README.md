VOCE HUMANO
Teste de Turing inverso inspirado em "Eu, Robô", de Isaac Asimov.


COMO INICIAR

1. Instale as dependências:
   npm install

2. Terminal 1, suba as APIs (json-server com os dilemas + servidor de resultados):
   npm run backend

3. Terminal 2, suba o Angular:
   npm start


Portas usadas: 4200 (Angular), 3000 (servidor de resultados), 3001 (json-server).
O Angular encaminha tudo que começa com /api para a porta 3000 (proxy.conf.json).

Versão de produção (site e API juntos na porta 3000):
   npm run build
   npm run backend
   abrir http://localhost:3000



ONDE CADA REQUISITO ESTÁ NO PROJETO

ESTRUTURA

- Pelo menos 3 rotas, com menu e destaque da página atual
  Rotas: src/app/app.routes.ts (/, /leis, /teste, /humanidade, /dilema/:id).
  Menu: src/app/layout/navigation.ts e src/app/layout/header/header.html.

- Rota com parâmetro levando a uma página de detalhe
  /dilema/:id -> src/app/pages/dilema/dilema.ts
  O id chega como input() graças ao withComponentInputBinding (src/app/app.config.ts).
  Para acessar: na página Humanidade, clique em um dos dilemas do gráfico
  "Os dilemas que mais derrubam" (ex.: /dilema/alavanca-do-trem).

- Rota ** de página não encontrada, dentro do tema.

COMPONENTES

- Pelo menos 2 componentes reutilizáveis recebendo dados por input()
  GraficoBarras: src/app/pages/humanidade/grafico-barras/ (usado duas vezes na página Humanidade).
  Questao: src/app/pages/teste/questao/ (usado no teste e na página /dilema/:id, em modo leitura).
  Também: GraficoPizza (grafico-pizza/) e Progresso (src/app/pages/teste/progresso/).

- Pelo menos 1 componente avisando o pai por output()
  Questao emite "respondida" para o Teste (src/app/pages/teste/questao/questao.ts).
  TesteIntro emite "iniciar" e "recarregar"; TesteConclusao emite "refazer".

- Uso de @if, @for com track e @empty
  @if: em praticamente todas as páginas.
  @for com track: src/app/pages/teste/progresso/progresso.html, grafico-barras.html, leis.html.
  @empty: src/app/pages/humanidade/grafico-barras/grafico-barras.html.

ESTADO

- Todo dado que muda na tela é signal


- Pelo menos 3 computed fazendo trabalho de verdade
  src/app/pages/humanidade/humanidade.ts:
    dilemasMaisErrados (filtra, calcula a taxa de erro, ordena e pega os 8 primeiros),
    prioridades (soma, percentual por lei e classificação da mais escolhida),
    maioria (encontra a categoria com mais pessoas).

- Nenhum valor derivado guardado em signal e atualizado na mão

DADOS

- Serviço responsável por buscar os dados, injetado com inject()
  DilemasService: src/app/data/dilemas.api.ts (lista e busca dilemas).
  HumanidadeApi: src/app/data/humanidade.api.ts (estatísticas e envio de resultados).
  
- Consumo de API com HttpClient ou httpResource
  httpResource: DilemasService e HumanidadeApi.estatisticas().
  HttpClient (inject(HttpClient)): HumanidadeApi.enviar() faz o POST do resultado.
  A API de dilemas é o json-server servindo api/db.json (GET /api/dilemas e /api/dilemas/:id).
  O servidor de resultados fica em server/index.mjs.

- Tratamento de carregando e de erro na tela


FORMULÁRIO

- Formulário com validação e botão desabilitado enquanto inválido
  Reactive Forms na tela inicial do teste: src/app/pages/teste/intro/intro.ts e intro.html.
