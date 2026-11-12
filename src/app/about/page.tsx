import type { Metadata } from 'next';
import { isAuthed } from '@/lib/cms/auth';
import { getDoc } from '@/lib/cms/store';
import type { AboutContent, HomeContent, SiteContent } from '@/lib/cms/defaults';
import SiteShell from '@/components/site/SiteShell';
import JsonLd from '@/components/site/JsonLd';
import { Area, Credentials, Intro, Principles, Story, Therapist } from '@/components/about/sections';
import { Cta } from '@/components/home/sections';
import { getSiteUrl } from '@/lib/siteUrl';
import { aboutStructuredData, pageMetadata } from '@/lib/seo';

// Content comes from the CMS store, so render on request.
export const dynamic = 'force-dynamic';

type Search = Promise<{ preview?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const [about, site, sp] = await Promise.all([
    getDoc<AboutContent>('about'),
    getDoc<SiteContent>('site'),
    searchParams,
  ]);
  return pageMetadata({
    base: await getSiteUrl(site.seo.siteUrl),
    path: '/about',
    title: about.seo.title,
    description: about.seo.description,
    image: about.seo.shareImage || site.seo.shareImage || about.intro.image,
    imageAlt: about.intro.imageAlt,
    // A preview link must never be indexed, even if someone shares it.
    noindex: about.seo.noindex || sp.preview !== undefined,
    googleVerification: site.seo.googleVerification,
  });
}

export default async function AboutPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const preview = sp.preview === '1' && (await isAuthed());
  const stage = preview ? 'draft' : 'published';

  const [about, home, site] = await Promise.all([
    getDoc<AboutContent>('about', stage),
    getDoc<HomeContent>('home', stage),
    getDoc<SiteContent>('site', stage),
  ]);
  const base = await getSiteUrl(site.seo.siteUrl);
  const showStructuredData = !!base && !preview && !about.seo.noindex;

  return (
    <SiteShell site={site} preview={preview} editorHref="/admin/about">
      {showStructuredData && <JsonLd data={aboutStructuredData(about, home, site, base)} />}
      <Intro intro={about.intro} site={site} />
      <Story story={about.story} image={about.intro.image} imageAlt={about.intro.imageAlt} />
      <Principles principles={about.principles} />
      <Therapist therapist={about.therapist} />
      <Credentials credentials={about.credentials} />
      <Area area={about.area} site={site} />
      <Cta cta={about.cta} site={site} />
    </SiteShell>
  );
}
