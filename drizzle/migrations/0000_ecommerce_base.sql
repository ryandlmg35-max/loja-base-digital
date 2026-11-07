-- Roles
create type public.app_role as enum ('admin', 'user');
create type public.pedido_status as enum ('pendente', 'pago', 'cancelado');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  criado_em timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Ver próprio perfil" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Editar próprio perfil" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Inserir próprio perfil" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Ver próprios papéis" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', ''), new.email);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Produtos
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  preco numeric(10,2) not null default 0 check (preco >= 0),
  imagem_url text,
  estoque integer not null default 0 check (estoque >= 0),
  criado_em timestamptz not null default now()
);
grant select on public.produtos to anon;
grant select, insert, update, delete on public.produtos to authenticated;
grant all on public.produtos to service_role;
alter table public.produtos enable row level security;
create policy "Leitura pública de produtos" on public.produtos for select to anon, authenticated using (true);
create policy "Admin insere produtos" on public.produtos for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admin edita produtos" on public.produtos for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admin remove produtos" on public.produtos for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Pedidos
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  status public.pedido_status not null default 'pendente',
  valor_total numeric(10,2) not null default 0,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.pedidos to authenticated;
grant all on public.pedidos to service_role;
alter table public.pedidos enable row level security;
create policy "Ver próprios pedidos" on public.pedidos for select to authenticated using (auth.uid() = usuario_id);
create policy "Criar próprios pedidos" on public.pedidos for insert to authenticated with check (auth.uid() = usuario_id);
create policy "Editar próprios pedidos" on public.pedidos for update to authenticated using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
create policy "Remover próprios pedidos" on public.pedidos for delete to authenticated using (auth.uid() = usuario_id);

-- Pedido itens
create table public.pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  produto_id uuid not null references public.produtos(id),
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null check (preco_unitario >= 0)
);
create index on public.pedido_itens (pedido_id);
grant select, insert, update, delete on public.pedido_itens to authenticated;
grant all on public.pedido_itens to service_role;
alter table public.pedido_itens enable row level security;
create policy "Ver próprios itens" on public.pedido_itens for select to authenticated
  using (exists (select 1 from public.pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()));
create policy "Criar próprios itens" on public.pedido_itens for insert to authenticated
  with check (exists (select 1 from public.pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()));
create policy "Editar próprios itens" on public.pedido_itens for update to authenticated
  using (exists (select 1 from public.pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()))
  with check (exists (select 1 from public.pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()));
create policy "Remover próprios itens" on public.pedido_itens for delete to authenticated
  using (exists (select 1 from public.pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()));

-- Produtos de exemplo
insert into public.produtos (nome, descricao, preco, estoque) values
  ('Camiseta Básica', 'Camiseta 100% algodão', 49.90, 100),
  ('Caneca Cerâmica', 'Caneca branca 300ml', 29.90, 50),
  ('Mochila Urbana', 'Mochila resistente à água', 189.00, 20);
