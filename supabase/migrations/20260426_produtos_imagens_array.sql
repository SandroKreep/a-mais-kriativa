-- Suporte para múltiplas imagens por produto
alter table public.produtos add column if not exists imagens text[];
