import { promises as fs } from 'fs';
import path from 'path';
import { DATA_ROOT } from './store';

export const UPLOAD_DIR = path.join(DATA_ROOT, 'uploads');

export type MediaKind = 'image' | 'video';

const MB = 1024 * 1024;
/** Limits in MB. The help text in the CMS quotes these numbers. */
export const MAX_PHOTO_MB = 8;
export const MAX_VIDEO_MB = 50;

export const MEDIA_TYPES: Record<string, { ext: string; kind: MediaKind; max: number }> = {
  'image/jpeg': { ext: 'jpg', kind: 'image', max: MAX_PHOTO_MB * MB },
  'image/png': { ext: 'png', kind: 'image', max: MAX_PHOTO_MB * MB },
  'image/webp': { ext: 'webp', kind: 'image', max: MAX_PHOTO_MB * MB },
  'image/avif': { ext: 'avif', kind: 'image', max: MAX_PHOTO_MB * MB },
  'video/mp4': { ext: 'mp4', kind: 'video', max: MAX_VIDEO_MB * MB },
  'video/webm': { ext: 'webm', kind: 'video', max: MAX_VIDEO_MB * MB },
};

export const EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

export const MEDIA_NAME = /^[\w-]+\.(jpg|png|webp|avif|mp4|webm)$/;

/** Checks the first bytes of the file so a renamed file of another kind is rejected. */
export function looksLikeType(buf: Buffer, ext: string): boolean {
  const at = (i: number, s: string) => buf.subarray(i, i + s.length).toString('latin1') === s;
  switch (ext) {
    case 'jpg':
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case 'png':
      return buf[0] === 0x89 && at(1, 'PNG');
    case 'webp':
      return at(0, 'RIFF') && at(8, 'WEBP');
    case 'avif':
    case 'mp4':
      return at(4, 'ftyp');
    case 'webm':
      return buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3;
    default:
      return false;
  }
}

export interface MediaItem {
  name: string;
  url: string;
  kind: MediaKind;
  size: number;
  uploadedAt: string;
  usedIn: string[];
}

async function contentText(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const stage of ['published', 'draft']) {
    try {
      const dir = path.join(DATA_ROOT, stage);
      for (const f of await fs.readdir(dir)) {
        if (f.endsWith('.json')) {
          out[`${stage}/${f.replace('.json', '')}`] = await fs.readFile(path.join(dir, f), 'utf8');
        }
      }
    } catch {
      /* folder not created yet */
    }
  }
  return out;
}

function usageOf(name: string, texts: Record<string, string>): string[] {
  const needle = `/media/${name}`;
  const docs = new Set<string>();
  for (const [k, text] of Object.entries(texts)) {
    if (text.includes(needle)) docs.add(k.split('/')[1]);
  }
  return [...docs];
}

export async function listMedia(): Promise<MediaItem[]> {
  let names: string[] = [];
  try {
    names = (await fs.readdir(UPLOAD_DIR)).filter((n) => MEDIA_NAME.test(n));
  } catch {
    return [];
  }
  const texts = await contentText();
  const items = await Promise.all(
    names.map(async (name) => {
      const st = await fs.stat(path.join(UPLOAD_DIR, name));
      const ext = name.split('.').pop() as string;
      return {
        name,
        url: `/media/${name}`,
        kind: (EXT_MIME[ext].startsWith('video') ? 'video' : 'image') as MediaKind,
        size: st.size,
        uploadedAt: st.mtime.toISOString(),
        usedIn: usageOf(name, texts),
      };
    }),
  );
  return items.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function deleteMedia(name: string): Promise<'deleted' | 'in-use' | 'missing'> {
  if (!MEDIA_NAME.test(name)) return 'missing';
  const used = usageOf(name, await contentText());
  if (used.length) return 'in-use';
  try {
    await fs.rm(path.join(UPLOAD_DIR, name));
    return 'deleted';
  } catch {
    return 'missing';
  }
}
