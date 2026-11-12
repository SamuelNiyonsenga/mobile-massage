import { NextResponse } from 'next/server';
import { destroySession, sameOrigin } from '@/lib/cms/auth';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Request blocked.' }, { status: 403 });
  await destroySession();
  return NextResponse.json({ ok: true });
}
