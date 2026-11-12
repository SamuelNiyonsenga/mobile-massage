import { getDoc } from '@/lib/cms/store';
import type { SiteContent } from '@/lib/cms/defaults';
import { robotsTxt } from '@/lib/seo';
import { getSiteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

export async function GET() {
  const site = await getDoc<SiteContent>('site');
  const base = await getSiteUrl(site.seo.siteUrl);
  return new Response(robotsTxt(base), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
