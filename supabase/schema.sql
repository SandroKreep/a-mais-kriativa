-- A+ Kriativa Marketplace - Schema inicial
-- Execute este script no SQL Editor do Supabase

create extension if not exists pgcrypto;

-- =========================
-- 1) usuarios
-- =========================
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  telefone text,
  foto_url text,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  criado_em timestamptz not null default now()
);

alter table public.usuarios add column if not exists whatsapp text;
alter table public.usuarios add column if not exists localizacao text;
alter table public.usuarios add column if not exists descricao_loja text;
alter table public.usuarios add column if not exists website text;
alter table public.usuarios add column if not exists tipo_perfil text;

-- =========================
-- 2) produtos
-- =========================
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  preco numeric(12, 2) not null check (preco >= 0),
  categoria text not null check (categoria in ('produtos', 'websites', 'personalizacao', 'servicos')),
  imagem_url text,
  localizacao text,
  vendedor_id uuid references public.usuarios(id) on delete set null,
  whatsapp text,
  telefone text,
  disponivel boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table public.produtos add column if not exists localizacao text;
alter table public.produtos add column if not exists vendedor_id uuid references public.usuarios(id) on delete set null;
alter table public.produtos add column if not exists whatsapp text;

alter table public.produtos add column if not exists telefone text;
alter table public.produtos add column if not exists imagens text[];
alter table public.produtos add column if not exists preco_original numeric(12, 2);
alter table public.produtos add column if not exists email text;

-- =========================
-- 3) pedidos
-- =========================
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'confirmado', 'entregue', 'cancelado')),
  total numeric(12, 2) not null default 0 check (total >= 0),
  criado_em timestamptz not null default now()
);

-- =========================
-- 4) itens_pedido
-- =========================
create table if not exists public.itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(12, 2) not null check (preco_unitario >= 0)
);

-- =========================
-- 5) personalizacoes
-- =========================
create table if not exists public.personalizacoes (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  tipo text not null check (tipo in ('frente', 'costas', 'bolso')),
  descricao text,
  imagem_url text
);

-- =========================
-- 6) avaliacoes
-- =========================
create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  nota integer not null check (nota between 1 and 5),
  comentario text,
  criado_em timestamptz not null default now(),
  constraint avaliacoes_unicas_por_usuario_produto unique (produto_id, usuario_id)
);

-- =========================
-- Índices úteis
-- =========================
create index if not exists idx_produtos_categoria on public.produtos(categoria);
create index if not exists idx_pedidos_usuario_id on public.pedidos(usuario_id);
create index if not exists idx_itens_pedido_pedido_id on public.itens_pedido(pedido_id);
create index if not exists idx_itens_pedido_produto_id on public.itens_pedido(produto_id);
create index if not exists idx_personalizacoes_pedido_id on public.personalizacoes(pedido_id);
create index if not exists idx_avaliacoes_produto_id on public.avaliacoes(produto_id);
create index if not exists idx_avaliacoes_usuario_id on public.avaliacoes(usuario_id);

-- =========================
-- RLS em todas as tabelas
-- =========================
alter table public.usuarios enable row level security;
alter table public.produtos enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.personalizacoes enable row level security;
alter table public.avaliacoes enable row level security;

-- Políticas iniciais (simples e seguras para começar)
-- Produtos públicos para leitura
drop policy if exists "produtos_select_publico" on public.produtos;
create policy "produtos_select_publico"
  on public.produtos
  for select
  to anon, authenticated
  using (true);

-- Vendedor autenticado pode inserir os seus próprios produtos
drop policy if exists "produtos_insert_autenticado_proprio" on public.produtos;
create policy "produtos_insert_autenticado_proprio"
  on public.produtos
  for insert
  to authenticated
  with check (vendedor_id = auth.uid());

-- Vendedor autenticado pode atualizar os seus próprios produtos
drop policy if exists "produtos_update_autenticado_proprio" on public.produtos;
create policy "produtos_update_autenticado_proprio"
  on public.produtos
  for update
  to authenticated
  using (vendedor_id = auth.uid())
  with check (vendedor_id = auth.uid());

-- Vendedor autenticado pode remover os seus próprios produtos
drop policy if exists "produtos_delete_autenticado_proprio" on public.produtos;
create policy "produtos_delete_autenticado_proprio"
  on public.produtos
  for delete
  to authenticated
  using (vendedor_id = auth.uid());

-- Avaliações públicas para leitura
drop policy if exists "avaliacoes_select_publico" on public.avaliacoes;
create policy "avaliacoes_select_publico"
  on public.avaliacoes
  for select
  to anon, authenticated
  using (true);

-- Permitir inserção de novos utilizadores (registo)
drop policy if exists "usuarios_insert" on public.usuarios;
create policy "usuarios_insert"
  on public.usuarios
  for insert
  to anon, authenticated
  with check (true);

-- Utilizador pode ver o seu próprio perfil
drop policy if exists "usuarios_select_proprio" on public.usuarios;
create policy "usuarios_select_proprio"
  on public.usuarios
  for select
  to authenticated
  using (auth.uid() = id);

-- Dados de contacto dos vendedores visíveis para todos no catálogo (incluindo visitantes)
drop policy if exists "usuarios_select_publico_catalogo" on public.usuarios;
create policy "usuarios_select_publico_catalogo"
  on public.usuarios
  for select
  to anon, authenticated
  using (true);

-- Utilizador pode atualizar o seu próprio perfil
drop policy if exists "usuarios_update_proprio" on public.usuarios;
create policy "usuarios_update_proprio"
  on public.usuarios
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =========================
-- 7) admin + estatísticas
-- =========================
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

-- Políticas temporárias para operações de admin no frontend (login local).
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
