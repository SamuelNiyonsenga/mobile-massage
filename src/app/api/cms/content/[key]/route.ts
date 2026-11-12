import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAuthed, sameOrigin } from '@/lib/cms/auth';
import { isDocKey } from '@/lib/cms/schemas';
import {
  discardDraft,
  getDoc,
  hasUnpublished,
  listHistory,
  publish,
  restoreVersion,
  saveDraft,
} from '@/lib/cms/store';

type Ctx = { params: Promise<{ key: string }> };

async function guard(req: Request, ctx: Ctx, mutating: boolean) {
  if (!(await isAuthed())) {
    return { error: NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 }) };
  }
  if (mutating && !sameOrigin(req)) {
    return { error: NextResponse.json({ error: 'Request blocked.' }, { status: 403 }) };
  }
  const { key } = await ctx.params;
  if (!isDocKey(key)) {
    return { error: NextResponse.json({ error: 'Unknown document.' }, { status: 404 }) };
  }
  return { key };
}

export async function GET(req: Request, ctx: Ctx) {
  const g = await guard(req, ctx, false);
  if ('error' in g) return g.error;
  return NextResponse.json({
    data: await getDoc(g.key, 'draft'),
    unpublished: await hasUnpublished(g.key),
    history: await listHistory(g.key),
  });
}

/** Save the draft. The public site is unchanged until Publish. */
export async function PUT(req: Request, ctx: Ctx) {
  const g = await guard(req, ctx, true);
  if ('error' in g) return g.error;
  const body = (await req.json().catch(() => null)) as { data?: unknown } | null;
  if (!body || typeof body.data !== 'object' || body.data === null) {
    return NextResponse.json({ error: 'No content received.' }, { status: 400 });
  }
  const data = await saveDraft(g.key, body.data);
  return NextResponse.json({ ok: true, data, unpublished: await hasUnpublished(g.key) });
}

/** Actions: publish, discard, restore */
export async function POST(req: Request, ctx: Ctx) {
  const g = await guard(req, ctx, true);
  if ('error' in g) return g.error;
  const body = (await req.json().catch(() => ({}))) as { action?: string; id?: string };

  if (body.action === 'publish') {
    const data = await publish(g.key);
    revalidatePath('/', 'layout');
    return NextResponse.json({
      ok: true,
      data,
      unpublished: false,
      history: await listHistory(g.key),
    });
  }

  if (body.action === 'discard') {
    const data = await discardDraft(g.key);
    return NextResponse.json({ ok: true, data, unpublished: false });
  }

  if (body.action === 'restore' && typeof body.id === 'string') {
    const data = await restoreVersion(g.key, body.id);
    if (!data) return NextResponse.json({ error: 'That version no longer exists.' }, { status: 404 });
    return NextResponse.json({ ok: true, data, unpublished: await hasUnpublished(g.key) });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
