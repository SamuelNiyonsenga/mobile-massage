import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'mm_admin';
const SESSION_MS = 1000 * 60 * 60 * 12;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') return '';
  return 'dev-only-secret-change-me';
}

function adminPassword() {
  const p = process.env.ADMIN_PASSWORD;
  if (p) return p;
  if (process.env.NODE_ENV === 'production') return '';
  return 'change-me-now';
}

function sign(value: string) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function checkPassword(input: string): boolean {
  const expected = adminPassword();
  if (!expected || !secret()) return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function createSession() {
  const exp = String(Date.now() + SESSION_MS);
  const jar = await cookies();
  jar.set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MS / 1000,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  if (!secret()) return false;
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split('.');
  if (!exp || !sig) return false;
  const expected = sign(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(exp) > Date.now();
}

/** Mutating requests must come from our own origin. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const attempts = new Map<string, { n: number; t: number }>();

/** Five wrong passwords per 15 minutes per address. */
export function loginAllowed(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.t > 15 * 60 * 1000) return true;
  return rec.n < 5;
}

export function recordLoginFailure(ip: string) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.t > 15 * 60 * 1000) attempts.set(ip, { n: 1, t: now });
  else rec.n += 1;
}

export function clearLoginFailures(ip: string) {
  attempts.delete(ip);
}
