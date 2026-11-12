import { getDoc } from '@/lib/cms/store';
import type { InsightsContent, SiteContent } from '@/lib/cms/defaults';
import { rssXml } from '@/lib/seo';
import { getSiteUrl } from '@/lib/siteUrl';
import { todayISO, visibleArticles } from '@/lib/insights';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [ins, site] = await Promise.all([getDoc<InsightsContent>('insights'), getDoc<SiteContent>('site')]);
  const base = await getSiteUrl(site.seo.siteUrl);
  if (!base || ins.seo.noindex) return new Response('Not found', { status: 404 });
  const articles = visibleArticles(ins, { preview: false, today: todayISO() });
  return new Response(rssXml({ base, insights: ins, articles }), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=1800' },
  });
}
