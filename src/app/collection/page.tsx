import type { Metadata } from 'next';
import { isAuthed } from '@/lib/cms/auth';
import { getDoc } from '@/lib/cms/store';
import type { CollectionContent, HomeContent, SiteContent } from '@/lib/cms/defaults';
import SiteShell from '@/components/site/SiteShell';
import JsonLd from '@/components/site/JsonLd';
import PageHero from '@/components/site/PageHero';
import { Menu, Guide } from '@/components/collection/Menu';
import { Cta } from '@/components/home/sections';
import Gallery from '@/components/home/Gallery';
import { groupTreatments, treatmentsOf } from '@/lib/collection';
import { getSiteUrl } from '@/lib/siteUrl';
import { collectionStructuredData, pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type Search = Promise<{ preview?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const [c, site, sp] = await Promise.all([getDoc<CollectionContent>('collection'), getDoc<SiteContent>('site'), searchParams]);
  return pageMetadata({
    base: await getSiteUrl(site.seo.siteUrl),
    path: '/collection',
    title: c.seo.title,
    description: c.seo.description,
    image: c.seo.shareImage || site.seo.shareImage || c.intro.image,
    imageAlt: c.intro.imageAlt,
    noindex: c.seo.noindex || sp.preview !== undefined,
    googleVerification: site.seo.googleVerification,
  });
}

export default async function CollectionPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const preview = sp.preview === '1' && (await isAuthed());
  const stage = preview ? 'draft' : 'published';
  const [c, home, site] = await Promise.all([
    getDoc<CollectionContent>('collection', stage),
    getDoc<HomeContent>('home', stage),
    getDoc<SiteContent>('site', stage),
  ]);

  const groups = groupTreatments(treatmentsOf(c));
  const base = await getSiteUrl(site.seo.siteUrl);
  const structured = !!base && !preview && !c.seo.noindex;

  return (
    <SiteShell site={site} preview={preview} editorHref="/admin/collection">
      {structured && <JsonLd data={collectionStructuredData(c, home, site, base)} />}
      <PageHero id="collection-title" eyebrow={c.intro.eyebrow} title={c.intro.headline} text={c.intro.text} image={c.intro.image} imageAlt={c.intro.imageAlt} />
      <Menu menu={c.menu} groups={groups} whatsapp={site.contact.whatsapp} />
      <Gallery gallery={c.gallery} />
      <Guide guide={c.guide} site={site} />
      <Cta cta={c.cta} site={site} />
    </SiteShell>
  );
}
