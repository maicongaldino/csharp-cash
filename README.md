# C#ASH — Controle Financeiro Pessoal em Angular

Aplicativo web simples e direto para organizar finanças pessoais: registra transações, gerencia gastos fixos, cartões e metas de economia. Feito com Angular 18 (standalone + Signals) e Tailwind CSS.

## Stack

- Angular 18 (standalone components, Angular Signals)
- TypeScript 5
- Tailwind CSS + PostCSS
- IndexedDB (Dexie) + localStorage
- File System Access API (salvar em arquivo local opcional)

## Como rodar

1. Instalar dependências:
   ```bash
   npm install
   ```
2. Ambiente de desenvolvimento:
   ```bash
   npm start
   ```
   Acessar em `http://localhost:4200/`.
3. Build de produção:
   ```bash
   npm run build
   ```
4. Preview com otimizações:
   ```bash
   npm run preview
   ```
5. Verificações:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Scripts relevantes

- `start` / `serve`: servidor de desenvolvimento Angular
- `build`: build para `dist/csharp-cash`
- `preview`: serve com `production` configuration
- `serve:hmr` / `start:hmr`: servidor com Hot Module Replacement (HMR)
- `typecheck`: checagem de tipos (sem emissão)
- `lint`: ESLint configurado com `angular-eslint` e regra do Prettier
- `format`: formata todo o projeto com Prettier
- `format:check`: verifica se o código está formatado pelo Prettier

## Padrão de Forms

- Componentes:
  - `app-form-field`: wrapper com `label`, `hint` e exibição automática de erros
  - `app-error-message`: mensagem de erro centralizada e personalizável
  - `app-currency-input`: input de moeda `pt-BR` com máscara (CVA)
  - `app-month-input`: input de mês com UI padronizada (CVA)
  - `app-categoria-select` / `app-pagamento-select`: selects integrados a Reactive Forms (CVA)
- Builders (`shared/forms/builders.ts`):
  - `buildNovoGastoForm(fb)`
  - `buildFixosForm(fb)`
  - `buildCartaoForm(fb)`
  - `createCategoriaAsyncValidator(categorias)`
- Telas padronizadas:
  - Dashboard (modal de novo gasto com wrappers e currency)
  - Fixos (form reativo com currency, selects e month-filter)
  - Carteira (form reativo com currency e color picker)

### Exemplo de uso

```html
<form [formGroup]="form">
  <app-form-field label="Valor" [controlName]="'valor'" [required]="true">
    <app-currency-input formControlName="valor"></app-currency-input>
  </app-form-field>
  <app-form-field label="Categoria" [controlName]="'categoria'" [required]="true">
    <app-categoria-select formControlName="categoria"></app-categoria-select>
  </app-form-field>
  <app-form-field label="Pagamento" [controlName]="'metodoPagamento'" [required]="true">
    <app-pagamento-select formControlName="metodoPagamento"></app-pagamento-select>
  </app-form-field>
</form>
```

## Mensagens de Erro personalizáveis

- `app-error-message` aceita `@Input() messages` para customização por tela:

```html
<app-error-message
  [control]="form.get('valor')"
  [messages]="{ required: 'Informe o valor', min: 'Valor mínimo é 0,01' }"
></app-error-message>
```

## Filtro de Mês rápido

- `app-month-input` padroniza o input de mês; botões rápidos (mês atual/anterior/próximo) serão adicionados.
- Exemplo:

```html
<app-month-input [ngModel]="mesAtual" (ngModelChange)="mesAtual = $event"></app-month-input>
```

## Estrutura

```
src/
 ├─ app/
 │   ├─ core/
 │   │   ├─ layout/ (Header + Shell)
 │   │   └─ services/ (estado, persistência, carteiras, fixos, transações, config)
 │   ├─ features/
 │   │   ├─ dashboard/ (resumo, gráfico, top categorias)
 │   │   ├─ fixos/ (cadastro e pagamento de gastos fixos)
 │   │   ├─ transacoes/ (lançamentos e histórico)
 │   │   ├─ carteira/ (cartões e limites)
 │   │   └─ planejamento/ (renda, meta %, objetivo)
 │   └─ shared/ (models e utils)
 ├─ assets/
 ├─ index.html
 ├─ main.ts
 └─ styles.css (Tailwind + utilitários)
```

## Conceitos principais

- Estado global com Signals em `AppStateService` (`src/app/core/services/app-state.service.ts`) consolidando `transacoes`, `fixos`, `cartoes` e `config`.
- Persistência híbrida em `PersistenciaService`:
  - Salva/recupera automaticamente em IndexedDB (Dexie) e também em `localStorage`.
  - Com arquivo vinculado, grava JSON via File System Access API.
  - `conectarArquivo()` abre write handle para `csharp-cash-dados.json`.
  - `salvar(dados)` grava JSON no arquivo vinculado.
  - `exportarDados(dados)` baixa backup (`backup-csharp-cash.json`).
  - `importarDadosDeInput(evento)` lê JSON de `<input type="file">`.
- Layout com `ShellComponent` e navegação por abas.
- Tailwind configurado via `postcss.config.cjs` e `tailwind.config.cjs`.

## Funcionalidades

- Dashboard: resumo financeiro, barras por dia/mês, top categorias.
- Fixos: cadastro, edição, remoção e pagamento que gera transação do mês.
- Transações: lançamento avulso, edição, filtro por mês e exclusão.
- Carteira: cadastro, edição e remoção de cartões (nome, limite, cor).
- Planejamento: renda, meta de economia (%), total guardado e objetivo.

## Persistência e backup

- Sem arquivo vinculado: dados são salvos em IndexedDB (Dexie) e também em `localStorage`.
- Com arquivo vinculado: auto-salva ao mudar estado (Signals + efeito) no arquivo e mantém IndexedDB/localStorage sincronizados.
- Sempre é possível exportar/importar JSON.

## Requisitos

- Node.js LTS (>= 18)
- Angular CLI instalado localmente via `devDependencies`

## Formatação com Prettier

O projeto é totalmente formatado com Prettier. Para aplicar formatação:

```bash
npm run format
```

Para verificar a formatação (CI/local):

```bash
npm run format:check
```

ESLint também valida a formatação via regra `prettier/prettier` (arquivos TypeScript). Arquivos gerados/cache e build são ignorados em `.prettierignore`.

## Roadmap sugerido

- Padronizar lint + format no CI (rodar `npm run format:check` e `npm run lint`).
- Aplicar padrão de forms nas telas de Transações e Planejamento.
- MonthInput com ações rápidas (atual/anterior/próximo).
- Helpers adicionais em `shared/forms` (ex.: `resetToDefaults(form, defaults)`).
- Adicionar testes unitários (Jasmine/Karma padrão do Angular ou Jest):
  - Services (`FixosService`, `TransacoesService`, `CarteiraService`, `ConfigService`).
  - Utils (`getIconeCategoria`).
- Persistência híbrida: fallback para `localStorage` quando File System Access não estiver disponível.
- Botões de Importar/Exportar no Header (UI): adicionar `<input type="file">` e botão “Exportar”.
- Melhorar acessibilidade (ARIA, foco, contraste) e responsividade.
- Internacionalização simples (i18n) ou ajuste fino para pt-BR.
- Formatação de moeda consistente e tolerância a timezone.
- Guardar receitas vs despesas e relatórios por categoria/período.

## Dicas de contribuição

- Manter SOLID/DRY/KISS e componentes pequenos.
- Preferir Signals para estado local e computados para derivação.
- Evitar logs de dados sensíveis; backups ficam no disco do usuário.
- Convenção de nomes: arquivos, parâmetros, variáveis, funções e métodos em português.

## Licença

Projeto pessoal. Use e modifique à vontade.

---

## Deploy no GitHub Pages

GitHub Pages hospeda arquivos estáticos. Para publicar o app diretamente com o script do projeto:

### Passo a passo

1. Publicar usando o script (repo: `csharp-cash`):

   ```bash
   npm run deploy:ghpages -- --repo csharp-cash
   ```

   Isso roda o build com `--base-href` e `--deploy-url` já configurados para `csharp-cash` e publica via `angular-cli-ghpages` na branch `gh-pages`.

2. Verificar publicação:
   - Acesse: `https://<seu-usuario>.github.io/csharp-cash/`

3. Somente build (sem publicar), se precisar:

   ```bash
   npm run build:ghpages -- --repo csharp-cash
   ```

### Roteamento no Pages

- GitHub Pages não faz rewrite para SPA. Caso use rotas sem hash, inclua um `404.html` copiando o `index.html` no diretório publicado.
- Alternativamente, use hash (`HashLocationStrategy`), resultando em URLs como `/#/transacoes`.

### Notas de API de Arquivos

- File System Access API requer HTTPS (Pages é HTTPS). Suporte é melhor em Chrome/Edge; Safari/Firefox podem limitar. O app mantém IndexedDB/localStorage como fallback.
