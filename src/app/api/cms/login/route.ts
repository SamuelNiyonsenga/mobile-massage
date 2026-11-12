import { NextResponse } from 'next/server';
import {
  checkPassword,
  clearLoginFailures,
  createSession,
  loginAllowed,
  recordLoginFailure,
  sameOrigin,
} from '@/lib/cms/auth';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Request blocked.' }, { status: 403 });

  const ip = (req.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  if (!loginAllowed(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Wait 15 minutes and try again.' },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === 'string' ? body.password : '';

  if (!checkPassword(password)) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: 'That password is not right.' }, { status: 401 });
  }

  clearLoginFailures(ip);
  await createSession();
  return NextResponse.json({ ok: true });
}
