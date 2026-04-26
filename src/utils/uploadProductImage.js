import { supabase } from '../supabase';

export const PRODUTOS_IMAGENS_BUCKET = 'produtos-imagens';

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Faz upload de uma imagem para o bucket público produtos-imagens e devolve o URL público.
 */
export async function uploadProductImageFile(file, userId) {
  if (!file || !userId) {
    throw new Error('Ficheiro ou sessão inválidos.');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('O ficheiro tem de ser uma imagem.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('A imagem não pode ultrapassar 5 MB.');
  }

  const rawExt = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const ext = rawExt.slice(0, 8) || 'jpg';
  const unique =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${userId}/${Date.now()}-${unique}.${ext}`;

  const { error } = await supabase.storage.from(PRODUTOS_IMAGENS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || `image/${ext}`,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(PRODUTOS_IMAGENS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Faz upload de múltiplas imagens e devolve lista de URLs públicas.
 */
export async function uploadProductImageFiles(files, userId) {
  const fileList = Array.isArray(files) ? files : [];
  if (!fileList.length) {
    throw new Error('Selecione pelo menos uma imagem.');
  }

  const uploadedUrls = await Promise.all(
    fileList.map((file) => uploadProductImageFile(file, userId))
  );
  return uploadedUrls;
}
