import { supabase } from './supabase';

const BUCKET = 'images';

export async function uploadImage(
  canvas: HTMLCanvasElement,
  folder: string,
  quality: number = 0.8,
): Promise<string | null> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', quality),
  );

  if (!blob) return null;

  const filePath = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, blob, {
    contentType: 'image/jpeg',
    upsert: false,
  });

  if (error) {
    console.error('Erro ao fazer upload:', error.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  return publicUrl;
}
