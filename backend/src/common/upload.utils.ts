import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { randomBytes } from 'crypto';

export const MB = 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/wave': '.wav',
  'audio/vnd.wave': '.wav',
};

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/vnd.wave',
];

/** Storage en disco con nombre aleatorio criptográficamente seguro. */
export function diskStorageWithPrefix(prefix = '') {
  return diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => {
      // La extensión sale del MIME validado, no del nombre enviado por el
      // cliente (evita subir .html/.svg con un Content-Type falso → XSS).
      const ext = MIME_EXT[file.mimetype] ?? '';
      cb(null, `${prefix}${randomBytes(12).toString('hex')}${ext}`);
    },
  });
}

/** Solo imágenes JPG/PNG/WEBP. */
export function imageFileFilter(
  _req: unknown,
  file: { mimetype: string },
  cb: (error: Error | null, accept: boolean) => void,
) {
  if (!IMAGE_MIMES.includes(file.mimetype)) {
    return cb(
      new BadRequestException('Solo se permiten imágenes JPG, PNG o WEBP.'),
      false,
    );
  }
  cb(null, true);
}

/** Audio (MP3/WAV) en los campos de audio e imagen en los de portada. */
export function trackFileFilter(
  _req: unknown,
  file: { mimetype: string; fieldname: string },
  cb: (error: Error | null, accept: boolean) => void,
) {
  const isAudioField = ['audio', 'audioFile'].includes(file.fieldname);
  const allowed = isAudioField ? AUDIO_MIMES : IMAGE_MIMES;
  if (!allowed.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        isAudioField
          ? 'El audio debe ser un archivo MP3 o WAV.'
          : 'La portada debe ser una imagen JPG, PNG o WEBP.',
      ),
      false,
    );
  }
  cb(null, true);
}

/** Acepta rutas /uploads/<archivo> o URLs http(s); rechaza cualquier otra cosa. */
export function isSafeMediaUrl(v: unknown): v is string {
  if (typeof v !== 'string' || v.length === 0 || v.length > 500) return false;
  if (/^\/uploads\/[A-Za-z0-9._-]+$/.test(v) && !v.includes('..')) return true;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}
