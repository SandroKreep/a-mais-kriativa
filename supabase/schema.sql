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
  email text,
  telefone text,
  disponivel boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table public.produtos add column if not exists localizacao text;
alter table public.produtos add column if not exists vendedor_id uuid references public.usuarios(id) on delete set null;
alter table public.produtos add column if not exists whatsapp text;
alter table public.produtos add column if not exists email text;
alter table public.produtos add column if not exists telefone text;

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

-- Utilizador pode atualizar o seu próprio perfil
drop policy if exists "usuarios_update_proprio" on public.usuarios;
create policy "usuarios_update_proprio"
  on public.usuarios
  for update
  to authenticated
  using (auth.uid() = id);
