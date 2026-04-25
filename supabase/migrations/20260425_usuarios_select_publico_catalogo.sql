-- Permitir que visitantes (anon) leiam dados de contacto do vendedor
-- usados no modal de produto: email, telefone, whatsapp, localizacao.

drop policy if exists "usuarios_select_publico_catalogo" on public.usuarios;

create policy "usuarios_select_publico_catalogo"
  on public.usuarios
  for select
  to anon, authenticated
  using (true);
