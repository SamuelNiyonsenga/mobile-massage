import { NextResponse } from 'next/server';
import { isAuthed, sameOrigin } from '@/lib/cms/auth';
import { deleteMedia, listMedia } from '@/lib/cms/media';

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  return NextResponse.json({ items: await listMedia() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Request blocked.' }, { status: 403 });

  const name = new URL(req.url).searchParams.get('name') ?? '';
  const result = await deleteMedia(name);
  if (result === 'in-use') {
    return NextResponse.json(
      { error: 'This file is used on the site. Remove it from the page first, then delete it.' },
      { status: 409 },
    );
  }
  if (result === 'missing') return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, items: await listMedia() });
}
