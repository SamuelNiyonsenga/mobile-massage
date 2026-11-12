import type { Metadata } from 'next';
import { isAuthed } from '@/lib/cms/auth';
import { getDoc } from '@/lib/cms/store';
import type { HomeContent, SiteContent } from '@/lib/cms/defaults';
import SiteShell from '@/components/site/SiteShell';
import JsonLd from '@/components/site/JsonLd';
import { getSiteUrl } from '@/lib/siteUrl';
import { pageMetadata, shareImageFor, structuredData } from '@/lib/seo';
import Gallery from '@/components/home/Gallery';
import {
  Band,
  Cta,
  Faq,
  Hero,
  Intro,
  Places,
  Process,
  Services,
  Testimonials,
  Why,
} from '@/components/home/sections';

// Content comes from the CMS store, so render on request.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const [home, site, sp] = await Promise.all([
    getDoc<HomeContent>('home'),
    getDoc<SiteContent>('site'),
    searchParams,
  ]);
  return pageMetadata({
    base: await getSiteUrl(site.seo.siteUrl),
    path: '/',
    title: home.seo.title,
    description: home.seo.description,
    image: shareImageFor(home, site),
    imageAlt: home.hero.imageAlt,
    // A preview link must never be indexed, even if someone shares it.
    noindex: home.seo.noindex || sp.preview !== undefined,
    googleVerification: site.seo.googleVerification,
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const sp = await searchParams;
  const preview = sp.preview === '1' && (await isAuthed());
  const stage = preview ? 'draft' : 'published';

  const [home, site] = await Promise.all([
    getDoc<HomeContent>('home', stage),
    getDoc<SiteContent>('site', stage),
  ]);
  const whatsapp = site.contact.whatsapp;
  const base = await getSiteUrl(site.seo.siteUrl);
  const showStructuredData = !!base && !preview && !home.seo.noindex;

  return (
    <SiteShell site={site} preview={preview} editorHref="/admin/home">
      {showStructuredData && <JsonLd data={structuredData(home, site, base)} />}
      <Hero hero={home.hero} whatsapp={whatsapp} />
      <Intro intro={home.intro} />
      <Band band={home.band} />
      <Places places={home.places} whatsapp={whatsapp} />
      <Why why={home.why} />
      <Services services={home.services} whatsapp={whatsapp} />
      <Process process={home.process} />
      <Gallery gallery={home.gallery} />
      <Testimonials testimonials={home.testimonials} />
      <Faq faq={home.faq} />
      <Cta cta={home.cta} site={site} />
    </SiteShell>
  );
}
