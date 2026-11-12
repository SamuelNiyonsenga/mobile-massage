import type { Metadata } from 'next';
import Link from 'next/link';
import { isAuthed } from '@/lib/cms/auth';
import { getDoc } from '@/lib/cms/store';
import type { HomeContent, InsightsContent, SiteContent } from '@/lib/cms/defaults';
import SiteShell from '@/components/site/SiteShell';
import JsonLd from '@/components/site/JsonLd';
import { Cta } from '@/components/home/sections';
import { Card, Lead } from '@/components/insights/Cards';
import { featuredOf, filterByTopic, topicsOf, todayISO, visibleArticles } from '@/lib/insights';
import { getSiteUrl } from '@/lib/siteUrl';
import { insightsStructuredData, pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type Search = Promise<{ preview?: string; topic?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const [ins, site, sp] = await Promise.all([getDoc<InsightsContent>('insights'), getDoc<SiteContent>('site'), searchParams]);
  return pageMetadata({
    base: await getSiteUrl(site.seo.siteUrl),
    path: '/insights',
    title: ins.seo.title,
    description: ins.seo.description,
    image: ins.seo.shareImage || site.seo.shareImage,
    // Filtered and preview views are copies of the main page, so they stay out of search.
    noindex: ins.seo.noindex || sp.preview !== undefined || !!sp.topic,
    googleVerification: site.seo.googleVerification,
    feed: '/insights/feed.xml',
  });
}

export default async function InsightsPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const preview = sp.preview === '1' && (await isAuthed());
  const stage = preview ? 'draft' : 'published';
  const [ins, home, site] = await Promise.all([
    getDoc<InsightsContent>('insights', stage),
    getDoc<HomeContent>('home', stage),
    getDoc<SiteContent>('site', stage),
  ]);

  const today = todayISO();
  const all = visibleArticles(ins, { preview, today });
  const topics = topicsOf(all);
  const topic = topics.find((t) => t.slug === sp.topic)?.slug ?? '';
  const shown = filterByTopic(all, topic);
  const lead = topic ? undefined : featuredOf(all);
  const rest = lead ? shown.filter((a) => a.slug !== lead.slug) : shown;

  const base = await getSiteUrl(site.seo.siteUrl);
  const structured = !!base && !preview && !ins.seo.noindex;
  const q = (extra: string) => `/insights${extra}${preview ? `${extra ? '&' : '?'}preview=1` : ''}`;

  return (
    <SiteShell site={site} preview={preview} editorHref="/admin/insights">
      {structured && <JsonLd data={insightsStructuredData(ins, all, home, site, base)} />}

      <section className="ihero" aria-labelledby="insights-title">
        <div className="ihero__bg" aria-hidden="true">
          <span className="ring ring--1" />
          <span className="ring ring--2" />
          <span className="ring ring--3" />
          <span className="ihero__breath">
            <span className="ihero__in">Breathe in</span>
            <span className="ihero__out">Breathe out</span>
          </span>
        </div>
        <div className="wrap ihero__body">
          <p className="ihero__script">{ins.intro.script}</p>
          <h1 id="insights-title" className="ihero__title">
            {ins.intro.headline}
          </h1>
          {ins.intro.text && <p className="ihero__text">{ins.intro.text}</p>}
          <p className="ihero__count">
            {all.length} {all.length === 1 ? 'guide' : 'guides'}
            {topics.length > 1 ? ` · ${topics.length} topics` : ''}
          </p>
        </div>
      </section>

      {all.length === 0 ? (
        <section className="sec">
          <div className="wrap">
            <p className="empty">New guides are on their way. In the meantime, you can book a massage or message us any time.</p>
          </div>
        </section>
      ) : (
        <>
          {lead && (
            <section className="sec ilead" aria-label="Featured guide">
              <div className="wrap">
                <Lead a={lead} today={today} />
              </div>
            </section>
          )}

          <section className="sec isec" id="articles" aria-label="All guides">
            <div className="wrap">
              {topics.length > 1 && (
                <nav className="topics" aria-label="Filter by topic">
                  <Link href={q('')} className="tchip" aria-current={topic ? undefined : 'true'} scroll={false}>
                    All <span>{all.length}</span>
                  </Link>
                  {topics.map((t) => (
                    <Link
                      key={t.slug}
                      href={q(`?topic=${t.slug}`)}
                      className="tchip"
                      aria-current={topic === t.slug ? 'true' : undefined}
                      scroll={false}
                    >
                      {t.name} <span>{t.count}</span>
                    </Link>
                  ))}
                </nav>
              )}
              {rest.length > 0 && (
                <div className="grid">
                  {rest.map((a, i) => (
                    <Card key={a.slug} a={a} n={i + 1 + (lead ? 1 : 0)} today={today} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <Cta cta={ins.cta} site={site} />
    </SiteShell>
  );
}
