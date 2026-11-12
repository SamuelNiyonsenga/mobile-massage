import { headers } from 'next/headers';
import { resolveSiteUrl } from '@/lib/seo';

/** The public address of the site, for canonical links, share previews and the sitemap. */
export async function getSiteUrl(configured?: string): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = (h.get('x-forwarded-proto') ?? 'http').split(',')[0].trim();
  return resolveSiteUrl({
    configured,
    env: process.env.SITE_URL,
    requestOrigin: host ? `${proto}://${host}` : undefined,
    production: process.env.NODE_ENV === 'production',
  });
}
