'use server';

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'marketing-images';

export async function uploadMarketingImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  const file = formData.get('file') as File | null;
  if (!file) return { error: 'No file provided' };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: 'Supabase not configured' };
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
