-- Suporte ao painel /admin
-- - bloqueio de utilizadores
-- - estatísticas de acessos e visualizações
-- - operações de gestão no frontend (temporário)

alter table public.usuarios add column if not exists bloqueado boolean not null default false;
alter table public.usuarios add column if not exists bloqueado_em timestamptz;

create table if not exists public.acessos_site (
  id uuid primary key default gen_random_uuid(),
  pagina text not null default '/',
  usuario_id uuid references public.usuarios(id) on delete set null,
  criado_em timestamptz not null default now()
);

create table if not exists public.visualizacoes_produto (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  usuario_id uuid references public.usuarios(id) on delete set null,
  criado_em timestamptz not null default now()
);

create index if not exists idx_acessos_site_criado_em on public.acessos_site(criado_em);
create index if not exists idx_visualizacoes_produto_produto_id on public.visualizacoes_produto(produto_id);
create index if not exists idx_visualizacoes_produto_criado_em on public.visualizacoes_produto(criado_em);

alter table public.acessos_site enable row level security;
alter table public.visualizacoes_produto enable row level security;

drop policy if exists "acessos_site_insert_publico" on public.acessos_site;
create policy "acessos_site_insert_publico"
  on public.acessos_site
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "acessos_site_select_publico" on public.acessos_site;
create policy "acessos_site_select_publico"
  on public.acessos_site
  for select
  to anon, authenticated
  using (true);

drop policy if exists "visualizacoes_produto_insert_publico" on public.visualizacoes_produto;
create policy "visualizacoes_produto_insert_publico"
  on public.visualizacoes_produto
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "visualizacoes_produto_select_publico" on public.visualizacoes_produto;
create policy "visualizacoes_produto_select_publico"
  on public.visualizacoes_produto
  for select
  to anon, authenticated
  using (true);

drop policy if exists "usuarios_update_admin_temp" on public.usuarios;
create policy "usuarios_update_admin_temp"
  on public.usuarios
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "usuarios_delete_admin_temp" on public.usuarios;
create policy "usuarios_delete_admin_temp"
  on public.usuarios
  for delete
  to anon, authenticated
  using (true);

drop policy if exists "produtos_delete_admin_temp" on public.produtos;
create policy "produtos_delete_admin_temp"
  on public.produtos
  for delete
  to anon, authenticated
  using (true);

drop policy if exists "pedidos_select_admin_temp" on public.pedidos;
create policy "pedidos_select_admin_temp"
  on public.pedidos
  for select
  to anon, authenticated
  using (true);
