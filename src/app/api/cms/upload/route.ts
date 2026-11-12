import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { isAuthed, sameOrigin } from '@/lib/cms/auth';
import { MEDIA_TYPES, UPLOAD_DIR, looksLikeType } from '@/lib/cms/media';

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Request blocked.' }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Choose a photo or video to upload.' }, { status: 400 });
  }

  const type = MEDIA_TYPES[file.type];
  if (!type) {
    return NextResponse.json(
      { error: 'Use a JPG, PNG, WebP or AVIF photo, or an MP4 or WebM video.' },
      { status: 415 },
    );
  }
  if (file.size > type.max) {
    const mb = Math.round(type.max / 1024 / 1024);
    return NextResponse.json(
      { error: `${type.kind === 'video' ? 'Videos' : 'Photos'} must be ${mb} MB or smaller.` },
      { status: 413 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (!looksLikeType(buf, type.ext)) {
    return NextResponse.json({ error: 'That file is not a valid ' + type.ext.toUpperCase() + '.' }, { status: 415 });
  }

  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${type.ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);

  return NextResponse.json({ url: `/media/${name}`, kind: type.kind });
}
