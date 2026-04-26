-- RLS para vendedores autenticados gerirem os seus produtos

drop policy if exists "produtos_insert_autenticado_proprio" on public.produtos;
create policy "produtos_insert_autenticado_proprio"
  on public.produtos
  for insert
  to authenticated
  with check (vendedor_id = auth.uid());

drop policy if exists "produtos_update_autenticado_proprio" on public.produtos;
create policy "produtos_update_autenticado_proprio"
  on public.produtos
  for update
  to authenticated
  using (vendedor_id = auth.uid())
  with check (vendedor_id = auth.uid());

drop policy if exists "produtos_delete_autenticado_proprio" on public.produtos;
create policy "produtos_delete_autenticado_proprio"
  on public.produtos
  for delete
  to authenticated
  using (vendedor_id = auth.uid());
