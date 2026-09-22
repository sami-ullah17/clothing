import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Ensure local uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ----------------------------------------------------
// Storage Provider Detection & Clients
// ----------------------------------------------------

let isCloudinaryConfigured = false;
if (
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET)
) {
  try {
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config();
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
    isCloudinaryConfigured = true;
    console.log('[Storage] Cloudinary permanent image storage active');
  } catch (err) {
    console.warn('[Storage] Failed to initialize Cloudinary:', err);
  }
}

let supabaseClient: SupabaseClient | null = null;
let isSupabaseStorageConfigured = false;
if (
  !isCloudinaryConfigured &&
  process.env.SUPABASE_URL &&
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)
) {
  try {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!;
    supabaseClient = createClient(process.env.SUPABASE_URL, key);
    isSupabaseStorageConfigured = true;
    console.log('[Storage] Supabase permanent image storage active');
  } catch (err) {
    console.warn('[Storage] Failed to initialize Supabase Storage client:', err);
  }
}

export type StorageEngine = 'cloudinary' | 'supabase' | 'local_disk';

export function getStorageEngine(): StorageEngine {
  if (isCloudinaryConfigured) return 'cloudinary';
  if (isSupabaseStorageConfigured) return 'supabase';
  return 'local_disk';
}

/**
 * Uploads an image (base64 string or buffer) to persistent storage.
 * 1. If Cloudinary is configured -> uploads to Cloudinary CDN (permanent HTTPS URL).
 * 2. If Supabase Storage is configured -> uploads to 'product-images' bucket (permanent HTTPS URL).
 * 3. Default fallback -> writes to public/uploads/ (permanent on non-ephemeral servers, or dev).
 */
export async function saveImageToStorage(
  imageInput: string | Buffer,
  filenameHint = 'boutique-item'
): Promise<string> {
  // If already an external HTTP/HTTPS URL, preserve it
  if (typeof imageInput === 'string') {
    const trimmed = imageInput.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('blob:')) {
      throw new Error('Temporary browser blob URLs cannot be stored permanently. Upload the file directly.');
    }
    if (trimmed.startsWith('/uploads/') && !trimmed.startsWith('data:image/')) {
      return trimmed;
    }
  }

  // Parse mime type & buffer from base64
  let mimeType = 'image/jpeg';
  let buffer: Buffer;
  let ext = 'jpg';

  if (Buffer.isBuffer(imageInput)) {
    buffer = imageInput;
  } else {
    let base64Payload = imageInput;
    if (imageInput.includes(';base64,')) {
      const parts = imageInput.split(';base64,');
      mimeType = parts[0].replace(/^data:/, '').trim() || 'image/jpeg';
      base64Payload = parts[1] || '';
    } else if (imageInput.startsWith('data:')) {
      const commaIndex = imageInput.indexOf(',');
      if (commaIndex !== -1) {
        mimeType = imageInput.substring(5, commaIndex).replace(';base64', '').trim() || 'image/jpeg';
        base64Payload = imageInput.substring(commaIndex + 1);
      }
    }

    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('svg')) ext = 'svg';
    else ext = 'jpg';

    const cleanBase64 = base64Payload.replace(/\s/g, '');
    buffer = Buffer.from(cleanBase64, 'base64');
  }

  if (buffer.length === 0) {
    throw new Error('Image data is empty');
  }

  const cleanHint = filenameHint.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const uniqueName = `${cleanHint}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

  // 1. Cloudinary Storage
  if (isCloudinaryConfigured) {
    try {
      const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;
      const uploadRes = await cloudinary.uploader.upload(dataUri, {
        folder: 'pri-boutique/products',
        public_id: `${cleanHint}-${Date.now()}`,
        resource_type: 'image',
        overwrite: true,
      });
      if (uploadRes?.secure_url) {
        return uploadRes.secure_url;
      }
    } catch (cErr: any) {
      console.error('[Storage] Cloudinary upload error, falling back:', cErr?.message || cErr);
    }
  }

  // 2. Supabase Storage
  if (isSupabaseStorageConfigured && supabaseClient) {
    try {
      const bucketName = 'product-images';
      // Ensure bucket exists or attempt upload
      const { data, error } = await supabaseClient.storage
        .from(bucketName)
        .upload(uniqueName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabaseClient.storage
          .from(bucketName)
          .getPublicUrl(uniqueName);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn('[Storage] Supabase storage upload warning:', error.message);
      }
    } catch (sErr: any) {
      console.error('[Storage] Supabase upload error, falling back:', sErr?.message || sErr);
    }
  }

  // 3. Local Disk Storage (/public/uploads)
  const localFilePath = path.join(UPLOADS_DIR, uniqueName);
  fs.writeFileSync(localFilePath, buffer);
  return `/uploads/${uniqueName}`;
}
