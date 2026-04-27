-- Campos de perfil em usuarios e contacto em produtos (usados por AuthModal e App.jsx)
alter table public.usuarios add column if not exists whatsapp text;
alter table public.usuarios add column if not exists localizacao text;
alter table public.usuarios add column if not exists descricao_loja text;
alter table public.usuarios add column if not exists website text;
alter table public.usuarios add column if not exists tipo_perfil text;

alter table public.produtos add column if not exists email text;
alter table public.produtos add column if not exists localizacao text;
alter table public.produtos add column if not exists telefone text;
alter table public.produtos add column if not exists whatsapp text;
alter table public.produtos add column if not exists imagens text[];
alter table public.produtos add column if not exists preco_original numeric(12, 2);
