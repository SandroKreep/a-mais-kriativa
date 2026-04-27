-- O painel /admin usa login local (sem sessão Supabase). Inserções anónimas
-- alinham-se ao padrão de policies "públicas" já usadas noutras tabelas.
drop policy if exists "produtos_removidos_insert_admin" on public.produtos_removidos;
create policy "produtos_removidos_insert_publico"
  on public.produtos_removidos
  for insert
  to anon, authenticated
  with check (true);
