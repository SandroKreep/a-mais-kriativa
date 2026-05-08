import { supabase } from '../supabase';
import { PRODUTOS_IMAGENS_BUCKET } from './uploadProductImage'; // Reusing the same bucket constant

const MAX_BYTES = 1 * 1024 * 1024; // 1 MB for avatars

/**
 * Faz upload de uma imagem de avatar para o bucket produtos-imagens e devolve o URL público.
 * Guarda no path: avatars/{userId}/avatar.{ext}
 */
export async function uploadAvatarImage(file, userId) {
  if (!file || !userId) {
    throw new Error('Ficheiro ou ID de utilizador inválidos para upload de avatar.');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('O ficheiro do avatar tem de ser uma imagem.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('A imagem do avatar não pode ultrapassar 1 MB.');
  }

  const rawExt = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const ext = rawExt.slice(0, 8) || 'jpg';
  const path = `avatars/${userId}/avatar.${ext}`; // Unique path for each user's avatar

  // Upload the file
  const { error: uploadError } = await supabase.storage.from(PRODUTOS_IMAGENS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true, // Upsert to replace existing avatar
    contentType: file.type || `image/${ext}`,
  });

  if (uploadError) {
    throw uploadError;
  }

  // Get the public URL
  const { data } = supabase.storage.from(PRODUTOS_IMAGENS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}