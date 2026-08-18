import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB } from '@/lib/upload-constants';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * Storage abstraction. Swap this file's implementation for an S3/Cloudinary
 * client later without touching any callers — both callers only depend on
 * `saveProductImage` / `deleteProductImage`.
 */
export interface ImageStorage {
  saveProductImage(userId: string, file: File): Promise<string>;
  deleteProductImage(url: string): Promise<void>;
}

class LocalDiskImageStorage implements ImageStorage {
  private uploadsRoot = path.join(process.cwd(), 'public', 'uploads');

  async saveProductImage(userId: string, file: File): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid image format. Allowed: JPEG, PNG, WEBP, GIF.');
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error(`Image too large. Max size is ${MAX_UPLOAD_SIZE_MB}MB.`);
    }

    const ext = EXT_BY_MIME[file.type] ?? 'jpg';
    const fileName = `${randomUUID()}.${ext}`;
    const userDir = path.join(this.uploadsRoot, userId);
    await mkdir(userDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(userDir, fileName), buffer);

    return `/uploads/${userId}/${fileName}`;
  }

  async deleteProductImage(url: string): Promise<void> {
    if (!url || !url.startsWith('/uploads/')) return;
    const filePath = path.join(process.cwd(), 'public', url);
    try {
      await unlink(filePath);
    } catch {
      // ignore missing files
    }
  }
}

export const imageStorage: ImageStorage = new LocalDiskImageStorage();
