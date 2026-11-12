import { getDoc, publishedAt } from '@/lib/cms/store';
import type { AboutContent, CollectionContent, ContactContent, HomeContent, SiteContent } from '@/lib/cms/defaults';
import { sitemapXml } from '@/lib/seo';
import { getSiteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [home, about, collection, contact, site] = await Promise.all([
    getDoc<HomeContent>('home'),
    getDoc<AboutContent>('about'),
    getDoc<CollectionContent>('collection'),
    getDoc<ContactContent>('contact'),
    getDoc<SiteContent>('site'),
  ]);
  const base = await getSiteUrl(site.seo.siteUrl);

  if (!base) {
    return new Response('Set the website address in the CMS (Site settings, Search and social) to enable the sitemap.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const [homeAt, aboutAt, collectionAt, contactAt] = await Promise.all([
    publishedAt('home'),
    publishedAt('about'),
    publishedAt('collection'),
    publishedAt('contact'),
  ]);
  return new Response(
    sitemapXml({
      base,
      home,
      about,
      collection,
      contact,
      lastModified: { home: homeAt, about: aboutAt, collection: collectionAt, contact: contactAt },
    }),
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
