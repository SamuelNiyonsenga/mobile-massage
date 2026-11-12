import { promises as fs, createReadStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { EXT_MIME, MEDIA_NAME, UPLOAD_DIR } from '@/lib/cms/media';

const CHUNK = 4 * 1024 * 1024;

/** Serves uploaded photos and videos. Supports Range requests so videos can start playing and be skipped through. */
export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const name = parts.length === 1 ? parts[0] : '';
  if (!MEDIA_NAME.test(name)) return new Response('Not found', { status: 404 });

  const full = path.join(UPLOAD_DIR, name);
  let size: number;
  try {
    size = (await fs.stat(full)).size;
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const headers: Record<string, string> = {
    'Content-Type': EXT_MIME[name.split('.').pop() as string],
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  };

  const range = req.headers.get('range');
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!m || (m[1] === '' && m[2] === '')) {
      return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${size}` } });
    }
    let start: number;
    let end: number;
    if (m[1] === '') {
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] ? Math.min(Number(m[2]), size - 1) : Math.min(start + CHUNK - 1, size - 1);
    }
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${size}` } });
    }
    const stream = Readable.toWeb(createReadStream(full, { start, end })) as unknown as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: {
        ...headers,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(end - start + 1),
      },
    });
  }

  const stream = Readable.toWeb(createReadStream(full)) as unknown as ReadableStream;
  return new Response(stream, { headers: { ...headers, 'Content-Length': String(size) } });
}
