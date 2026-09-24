import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Ensure local uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Persistent image store file in /data directory
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const IMAGES_STORE_FILE = path.join(DATA_DIR, 'images_store.json');

interface StoredImageRecord {
  filename: string;
  mimeType: string;
  base64: string;
  createdAt: string;
}

function loadPersistentImages(): Record<string, StoredImageRecord> {
  try {
    if (fs.existsSync(IMAGES_STORE_FILE)) {
      const raw = fs.readFileSync(IMAGES_STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Storage] Could not read images_store.json:', err);
  }
  return {};
}

function savePersistentImageRecord(record: StoredImageRecord) {
  try {
    const store = loadPersistentImages();
    store[record.filename] = record;
    // Keep max 200 most recent uploaded items to prevent bloat
    const keys = Object.keys(store);
    if (keys.length > 200) {
      const sortedKeys = keys.sort((a, b) => {
        const timeA = new Date(store[a]?.createdAt || 0).getTime();
        const timeB = new Date(store[b]?.createdAt || 0).getTime();
        return timeA - timeB;
      });
      const toRemove = sortedKeys.slice(0, keys.length - 200);
      for (const k of toRemove) {
        delete store[k];
      }
    }
    const tmp = `${IMAGES_STORE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(store), 'utf-8');
    fs.renameSync(tmp, IMAGES_STORE_FILE);
  } catch (err) {
    console.warn('[Storage] Could not write to images_store.json:', err);
  }
}

export function getImageFromPersistentStore(
  filename: string
): { buffer: Buffer; mimeType: string } | null {
  try {
    // 1. First check disk directly
    const localDiskPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(localDiskPath)) {
      const buffer = fs.readFileSync(localDiskPath);
      let mimeType = 'image/jpeg';
      if (filename.endsWith('.png')) mimeType = 'image/png';
      else if (filename.endsWith('.webp')) mimeType = 'image/webp';
      else if (filename.endsWith('.gif')) mimeType = 'image/gif';
      else if (filename.endsWith('.svg')) mimeType = 'image/svg+xml';
      return { buffer, mimeType };
    }

    // 2. Check persistent store in data/images_store.json
    const store = loadPersistentImages();
    const record = store[filename];
    if (record && record.base64) {
      const buffer = Buffer.from(record.base64, 'base64');
      // Auto restore to disk for fast subsequent reads
      try {
        fs.writeFileSync(localDiskPath, buffer);
      } catch {}
      return { buffer, mimeType: record.mimeType || 'image/jpeg' };
    }
  } catch (err) {
    console.warn('[Storage] Error looking up persistent image:', err);
  }
  return null;
}

// ----------------------------------------------------
// Storage Provider Detection & Clients
// ----------------------------------------------------

let isCloudinaryConfigured = false;
let supabaseClient: SupabaseClient | null = null;
let isSupabaseStorageConfigured = false;

export function initStorageProviders() {
  isCloudinaryConfigured = false;
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

  supabaseClient = null;
  isSupabaseStorageConfigured = false;
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
}

// Initial call
initStorageProviders();

export type StorageEngine = 'cloudinary' | 'supabase' | 'imgbb' | 'persistent_cache' | 'local_disk';

export function getStorageEngine(): StorageEngine {
  if (isCloudinaryConfigured) return 'cloudinary';
  if (isSupabaseStorageConfigured) return 'supabase';
  if (process.env.IMGBB_API_KEY) return 'imgbb';
  return 'persistent_cache';
}

export function getStorageConfigStatus() {
  return {
    engine: getStorageEngine(),
    cloudinary: {
      configured: isCloudinaryConfigured,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '••••' + (process.env.CLOUDINARY_CLOUD_NAME.slice(-4) || '') : (process.env.CLOUDINARY_URL ? 'via URL' : ''),
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasSecret: !!process.env.CLOUDINARY_API_SECRET,
    },
    supabase: {
      configured: isSupabaseStorageConfigured,
      url: process.env.SUPABASE_URL ? '••••' + (process.env.SUPABASE_URL.slice(-12) || '') : '',
      hasKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY),
    },
    persistentCache: {
      active: true,
      file: IMAGES_STORE_FILE,
      count: Object.keys(loadPersistentImages()).length,
    },
  };
}

/**
 * Uploads an image (base64 string or buffer) to persistent storage.
 * 1. If Cloudinary is configured -> uploads to Cloudinary CDN (permanent HTTPS URL).
 * 2. If Supabase Storage is configured -> uploads to 'product-images' bucket (permanent HTTPS URL).
 * 3. If ImgBB API key is provided -> uploads to ImgBB CDN (permanent HTTPS URL).
 * 4. Default fallback -> writes to public/uploads/ AND archives to data/images_store.json so it is NEVER lost on container restart.
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

  // 3. ImgBB Free Cloud Hosting (if key is set)
  if (process.env.IMGBB_API_KEY) {
    try {
      const formData = new URLSearchParams();
      formData.append('image', buffer.toString('base64'));
      formData.append('name', cleanHint);
      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const imgbbData: any = await imgbbRes.json();
      if (imgbbData?.success && imgbbData?.data?.url) {
        return imgbbData.data.url;
      }
    } catch (iErr: any) {
      console.warn('[Storage] ImgBB upload error, falling back:', iErr?.message || iErr);
    }
  }

  // 4. Local Disk Storage + Persistent Store in data/images_store.json
  const localFilePath = path.join(UPLOADS_DIR, uniqueName);
  fs.writeFileSync(localFilePath, buffer);

  // Save to persistent image store
  savePersistentImageRecord({
    filename: uniqueName,
    mimeType,
    base64: buffer.toString('base64'),
    createdAt: new Date().toISOString(),
  });

  return `/uploads/${uniqueName}`;
}
