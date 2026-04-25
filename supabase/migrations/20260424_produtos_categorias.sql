-- Migração: categorias normalizadas em public.produtos
-- Valores: produtos | websites | personalizacao | servicos
-- Execute no SQL Editor do Supabase se a tabela ainda tiver o CHECK antigo (camisetas/...).

alter table public.produtos drop constraint if exists produtos_categoria_check;

alter table public.produtos
  add constraint produtos_categoria_check
  check (categoria in ('produtos', 'websites', 'personalizacao', 'servicos'));
