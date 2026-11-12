import type { Metadata } from 'next';
import { isAuthed } from '@/lib/cms/auth';
import { getDoc } from '@/lib/cms/store';
import type { GalleryContent, HomeContent, SiteContent } from '@/lib/cms/defaults';
import SiteShell from '@/components/site/SiteShell';
import JsonLd from '@/components/site/JsonLd';
import { Cta } from '@/components/home/sections';
import GalleryWall from '@/components/gallery/GalleryWall';
import { galleryShareImage, topicsOfItems, usableItems } from '@/lib/gallery';
import { getSiteUrl } from '@/lib/siteUrl';
import { galleryStructuredData, pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type Search = Promise<{ preview?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const [g, site, sp] = await Promise.all([getDoc<GalleryContent>('gallery'), getDoc<SiteContent>('site'), searchParams]);
  const items = usableItems(g.items);
  return pageMetadata({
    base: await getSiteUrl(site.seo.siteUrl),
    path: '/gallery',
    title: g.seo.title,
    description: g.seo.description,
    image: galleryShareImage(g.seo.shareImage, items) || site.seo.shareImage,
    imageAlt: items.find((i) => i.kind === 'image')?.alt,
    noindex: g.seo.noindex || sp.preview !== undefined,
    googleVerification: site.seo.googleVerification,
  });
}

export default async function GalleryPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const preview = sp.preview === '1' && (await isAuthed());
  const stage = preview ? 'draft' : 'published';
  const [g, home, site] = await Promise.all([
    getDoc<GalleryContent>('gallery', stage),
    getDoc<HomeContent>('home', stage),
    getDoc<SiteContent>('site', stage),
  ]);

  const items = usableItems(g.items);
  const topics = topicsOfItems(items);
  const photos = items.filter((i) => i.kind === 'image').length;
  const videos = items.length - photos;
  const base = await getSiteUrl(site.seo.siteUrl);
  const structured = !!base && !preview && !g.seo.noindex;

  return (
    <SiteShell site={site} preview={preview} editorHref="/admin/gallery">
      {structured && <JsonLd data={galleryStructuredData(g, home, site, base)} />}

      <section className="ghero" aria-labelledby="gallery-title">
        <div className="wrap ghero__in">
          <p className="ghero__script">{g.intro.script}</p>
          <h1 id="gallery-title" className="ghero__title">
            {g.intro.headline}
          </h1>
          {g.intro.text && <p className="ghero__text">{g.intro.text}</p>}
          {items.length > 0 && (
            <p className="ghero__count">
              {photos > 0 && `${photos} ${photos === 1 ? 'photo' : 'photos'}`}
              {photos > 0 && videos > 0 && ' · '}
              {videos > 0 && `${videos} ${videos === 1 ? 'video' : 'videos'}`}
            </p>
          )}
        </div>
      </section>

      <section className="sec gsec" aria-label="Photos and videos">
        <div className="wrap">
          {items.length > 0 ? (
            <GalleryWall items={items} topics={topics} />
          ) : (
            <div className="gempty">
              <div className="gempty__arches" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p>New photos and videos are on their way. Message us any time to see more of our work.</p>
            </div>
          )}
        </div>
      </section>

      <Cta cta={g.cta} site={site} />
    </SiteShell>
  );
}
