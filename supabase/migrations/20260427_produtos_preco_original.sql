-- Suporte para preço original (para mostrar desconto/promoção)
alter table public.produtos add column if not exists preco_original numeric(12, 2);
