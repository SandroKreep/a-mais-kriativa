-- Bucket público para imagens de produtos (executar no SQL Editor do Supabase)
-- Nome do bucket: produtos-imagens

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'produtos-imagens',
  'produtos-imagens',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública (URL público)
drop policy if exists "produtos_imagens_select_publico" on storage.objects;
create policy "produtos_imagens_select_publico"
  on storage.objects
  for select
  to public
  using (bucket_id = 'produtos-imagens');

-- Upload apenas para utilizadores autenticados, na pasta com o seu user id
drop policy if exists "produtos_imagens_insert_autenticado" on storage.objects;
create policy "produtos_imagens_insert_autenticado"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'produtos-imagens'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Apagar apenas os próprios ficheiros
drop policy if exists "produtos_imagens_delete_proprio" on storage.objects;
create policy "produtos_imagens_delete_proprio"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'produtos-imagens'
    and split_part(name, '/', 1) = auth.uid()::text
  );
