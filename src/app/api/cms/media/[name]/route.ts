import { NextResponse } from 'next/server';
import { isAuthed, sameOrigin } from '@/lib/cms/auth';
import { deleteMedia } from '@/lib/cms/media';

export async function DELETE(req: Request, ctx: { params: Promise<{ name: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Request blocked.' }, { status: 403 });

  const { name } = await ctx.params;
  const result = await deleteMedia(name);

  if (result === 'in-use') {
    return NextResponse.json(
      { error: 'This file is used on the site. Remove it from the page first, then delete it.' },
      { status: 409 },
    );
  }
  if (result === 'missing') {
    return NextResponse.json({ error: 'That file could not be found.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
