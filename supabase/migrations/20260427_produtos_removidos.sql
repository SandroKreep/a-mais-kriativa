-- Tabela para rastrear produtos estáticos removidos
create table if not exists public.produtos_removidos (
  id uuid primary key default gen_random_uuid(),
  produto_id text not null unique,
  tipo text not null check (tipo in ('product', 'custom', 'service')),
  nome text,
  criado_em timestamptz not null default now()
);

alter table public.produtos_removidos enable row level security;

-- Política: qualquer um pode ler os produtos removidos (necessário para filtrar)
drop policy if exists "produtos_removidos_select_publico" on public.produtos_removidos;
create policy "produtos_removidos_select_publico"
  on public.produtos_removidos
  for select
  to anon, authenticated
  using (true);

-- Política: apenas admin pode inserir
drop policy if exists "produtos_removidos_insert_admin" on public.produtos_removidos;
create policy "produtos_removidos_insert_admin"
  on public.produtos_removidos
  for insert
  to authenticated
  with check (true);

-- Índice para performance
create index if not exists idx_produtos_removidos_produto_id on public.produtos_removidos(produto_id);
