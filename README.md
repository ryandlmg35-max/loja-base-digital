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
- **Rotas**: `/`, `/cat/$id`, `/product/$id`, `/faq`, `/login`, `/support`, `/cart`, `/toplist`, `/vendor/$id`.
  A listagem faz 12 produtos por página em 7 páginas, igual ao original.

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

**Autenticação:** `/login` usa Supabase Auth (email + senha). O `username` do formulário original
vira o campo `nome` do perfil. O checkout exige login — igual ao site original.

**Carrinho:** client-side (`localStorage`, chave `steroid-store.cart.v1`), com as mesmas regras de
pedido mínimo ($ 60) e frete ($ 5, grátis acima de $ 200) do original.

### Re-scraping / manutenção

O dump das páginas do `.onion` fica em `C:\Users\ryan\steroid-clone\dump` (fora do repo) e os scripts
em `scripts/`:

```sh
# 1. baixa as páginas e os assets pelo Tor (SOCKS5 127.0.0.1:9150)
powershell -File C:\Users\ryan\steroid-clone\fetch.ps1
powershell -File C:\Users\ryan\steroid-clone\fetch-assets.ps1
powershell -File C:\Users\ryan\steroid-clone\fetch-extra.ps1

# 2. regenera src/data/catalog.ts, src/data/footer-seo.ts e seed/catalogo.sql
node scripts/extract-catalog.mjs
```

### Scripts

```sh
bun install
bun run dev      # http://localhost:8080
bun run build    # build de produção (nitro/worker)
bun run test     # vitest
bun run lint     # eslint + prettier
```

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
