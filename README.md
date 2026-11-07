# Loja Base Digital

## Store clone — "Simply Steroids" (American Pharma)

Este repositório agora é um clone fiel da vitrine `.onion` `steroid2pmi2vin7vzkaalwreb2y64qtmo5k5paf45txdqxnvmrqbvyd.onion`,
construído por cima da base Lovable (TanStack Start + Supabase + Drizzle).

### O que foi clonado

- **Layout e CSS originais**: Bootstrap 2.3.2, `style.php` (renomeado para `style.css`) e Font Awesome 3.2.1
  em `public/css` + `public/font`. `public/css/clone-fix.css` só neutraliza o preflight do Tailwind v4
  (que existe no template da Lovable) para as imagens inline do cabeçalho/rodapé.
- **Assets**: logo, banner `header_bg_1.gif`, botões de origem (USA/EU/UK), 71 fotos de produto,
  ícones de pagamento (Monero, BTC, ETH, LTC, SOL, DOGE, TRON, XRP, USDT) e foto do vendor em `public/images`.
- **Catálogo**: 79 produtos, 15 categorias, 3 vendors e 6 blocos de FAQ, extraídos das páginas reais
  (ver `src/data/catalog.ts`).
- **Rotas**: `/`, `/cat/$id`, `/product/$id`, `/faq`, `/login`, `/support`, `/cart`, `/toplist`, `/vendor/$id`
  e `/admin` (painel interno de sincronização do catálogo). A listagem faz 12 produtos por página em
  7 páginas, igual ao original.

### Banco de dados (o que a Lovable já deixou pronto)

| tabela          | uso no clone                                                        |
| --------------- | ------------------------------------------------------------------- |
| `produtos`      | catálogo (preço, estoque, descrição) — opcional, ver seed abaixo      |
| `pedidos`       | cabeçalho do pedido criado no checkout                              |
| `pedido_itens`  | linhas do pedido (produto_id, quantidade, preco_unitario)           |
| `profiles`      | usuário (criado automaticamente pelo trigger `handle_new_user`)      |
| `user_roles`    | papel admin/user                                                    |

O app já funciona sem seed: `src/data/catalog.ts` traz o catálogo completo e a página mostra os
produtos com o preço original. Quando o banco tiver o catálogo, ele passa a ser a fonte de verdade
(sobrescreve preço/estoque/descrição) — `src/lib/catalog-db.ts` faz a fusão.

**Seed (uma vez):** cole `seed/catalogo.sql` no editor SQL da Lovable (ou no SQL Editor do Supabase).
Ele apaga e reinsere os 79 produtos de forma idempotente. Sem ele, o checkout avisa quais produtos
faltam no banco.

**Sincronização pela própria loja (sem colar SQL):** o painel `/admin` chama `POST /api/sync-catalog`,
que usa a service-role key do runtime Lovable Cloud (`SUPABASE_SERVICE_ROLE_KEY`) e grava/atualiza os
79 produtos em `produtos`. Exige uma conta com papel `admin`:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'SEU_EMAIL';
```

Fora do Lovable Cloud (dev local) a rota responde `503 admin_key_unavailable` — aí o caminho é o
`seed/catalogo.sql`.

**Autenticação:** `/login` usa Supabase Auth (email + senha). O `username` do formulário original
vira o campo `nome` do perfil. O checkout exige login — igual ao site original.

O projeto Supabase está com **"Confirm email" ligado**, então uma conta nova só entra depois de
confirmar o e-mail (e o SMTP padrão do Lovable não entrega para caixas externas). Duas saídas:

1. **Instantâneo na Lovable Cloud:** o app primeiro chama `POST /api/register`, que cria a conta com
   `email_confirm: true` (mesma service-role key) e o login acontece na hora. Para voltar ao fluxo
   padrão, defina `AUTO_CONFIRM_EMAIL=false` nos Secrets.
2. **Confirmar e-mail manualmente:** no editor SQL da Lovable:

   ```sql
   update auth.users set email_confirmed_at = now() where email = 'SEU_EMAIL';
   ```

   O botão "Resend confirmation" na tela de login reenvia o e-mail de confirmação.

**Carrinho:** client-side (`localStorage`, chave `steroid-store.cart.v1`), com as mesmas regras de
pedido mínimo ($ 60) e frete ($ 5, grátis acima de $ 200) do original.

### Checkout e pagamento

O checkout grava o pedido em `pedidos` (status `pendente`) e as linhas em `pedido_itens` — as linhas
são ligadas por nome de produto em `produtos`, então o catálogo precisa estar no banco (seed ou sync).
Produtos sem registro correspondente não quebram o pedido: o app salva o cabeçalho e avisa na tela
quais linhas ficaram de fora.

Depois de enviar o pedido, a tela mostra o recibo (id do pedido, data, status, itens, total) e o
**rail de pagamento** com os endereços crypto publicados pela loja. Eles vêm do ambiente:

```sh
VITE_CRYPTO_MONERO=...
VITE_CRYPTO_BITCOIN=...
VITE_CRYPTO_ETHEREUM=...
VITE_CRYPTO_LITECOIN=...
VITE_CRYPTO_SOLANA=...
VITE_CRYPTO_TRON=...
VITE_CRYPTO_USDT=...
```

Sem nenhum endereço configurado o painel cai no texto original: o cliente pede o endereço e o
comprovante na página `/support`. Depois da confirmação do pagamento, o status do pedido muda de
`pendente` para `pago` (no dashboard do Lovable/Supabase).

### Re-scraping / manutenção

O dump das páginas do `.onion` fica em `C:\Users\ryan\steroid-clone\dump` (fora do repo) e os scripts
em `scripts/`:

```sh
# 1. baixa as páginas e os assets pelo Tor (SOCKS5 127.0.0.1:9150)
powershell -File scripts/fetch-pages.ps1
powershell -File scripts/fetch-assets.ps1
powershell -File scripts/fetch-extra.ps1

# 2. regenera src/data/catalog.ts, src/data/footer-seo.ts e seed/catalogo.sql
node scripts/extract-catalog.mjs
```

O `extract-catalog.mjs` lê o dump de `C:\Users\ryan\steroid-clone\dump` por padrão; aponte outro
caminho com `ONION_DUMP=... node scripts/extract-catalog.mjs`.

### Scripts

```sh
bun install
bun run dev      # http://localhost:8080
bun run build    # build de produção (nitro/worker)
bun run test     # vitest
bun run lint     # eslint + prettier
```

### Verificação (E2E)

O harness de navegador fica em `scripts/e2e-store.mjs` (Playwright + Chromium do sistema):

```sh
npm i playwright-core
node scripts/e2e-store.mjs          # 31 checks: home, produto, carrinho, cadastro, login,
                                    # persistência, FAQ, toplist, vendor, categorias, admin, 404
```

Ele roda contra o dev server (`BASE_URL` para trocar) e salva screenshots + `e2e-report.json` em
`SHOTS_DIR`.

### O que foi verificado

| área | como foi verificada | status |
| --- | --- | --- |
| home, paginação, CSS, assets | E2E no Chromium (Bootstrap, 12 cards, pager `1 / 7`, 9 ícones) | ok |
| clique no produto, descrição, imagem | E2E + conferência do HTML SSR com o dump do `.onion` | ok |
| carrinho, frete, total, badge, persistência | E2E (`$ 54 + $ 5 = $ 59`) + `cartTotals` unit test | ok |
| cadastro | E2E real contra o Supabase (conta criada, trigger `profiles` ok) | ok |
| login | E2E: senha errada → `Invalid login credentials`; e-mail não confirmado → aviso + botão de reenvio | ok |
| checkout → `pedidos` + `pedido_itens` | teste de integração com o cliente Supabase mockado (5 casos, incl. rollback) | ok |
| painel de pagamento | teste de componente (`PaymentPanel`: recibo, itens, endereços, aviso de linhas pendentes) | ok |
| `/api/register`, `/api/sync-catalog` | curl local: `503 admin_key_unavailable` (sem service-role key) e `403` cross-origin | ok |
| escrita real no banco | exige conta confirmada + catálogo no banco — passos abaixo | bloqueado no projeto |

Duas coisas travam a última linha até o Sam mexer no projeto Supabase (2 minutos):

1. **E-mail de confirmação:** o projeto está com "Confirm email" ligado e o SMTP padrão do Lovable
   não entrega em caixa externa — ou use `POST /api/register` (resolve sozinho na Lovable Cloud),
   ou desative "Confirm email" no painel de Auth, ou confirme o e-mail com o SQL acima.
2. **Catálogo no banco:** cole `seed/catalogo.sql` ou use `/admin` → "Sync catalog to database"
   (com a conta em `user_roles` como `admin`).

Sem esses dois passos o checkout ainda grava o cabeçalho do pedido e mostra o aviso das linhas
pendentes — o pedido não se perde.

---

## Base original do e-commerce (Lovable)

Quero criar a base de um e-commerce. Por enquanto só preciso da infraestrutura de backend funcionando — não precisa caprichar no visual, pode ser uma página inicial bem simples e genérica.

1. Conecte o projeto ao Supabase (crie um novo projeto Supabase se necessário).

2. Configure autenticação de usuários (Supabase Auth):

   - Cadastro e login com email/senha

   - Tabela de perfis (profiles) vinculada ao usuário autenticado, com: nome, email, criado_em

3. Crie as tabelas no banco de dados:

   - produtos: id, nome, descricao, preco, imagem_url, estoque, criado_em

   - pedidos: id, usuario_id (referência a auth.users), status (pendente, pago, cancelado), valor_total, criado_em

   - pedido_itens: id, pedido_id, produto_id, quantidade, preco_unitario

4. Configure Row Level Security (RLS) nas tabelas:

   - produtos: leitura pública, escrita só por admin

   - pedidos e pedido_itens: cada usuário só vê e edita os próprios registros

5. Crie uma página inicial bem básica só pra confirmar que a conexão está funcionando: um formulário de login/cadastro e uma listagem simples dos produtos da tabela (pode ser só texto, sem estilização).

Não precisa criar páginas de produto individuais, carrinho ou checkout — isso eu vou construir depois, por fora do Lovable.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/777c6e5b-df74-49d3-bd2e-a58d72e4ba39).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
