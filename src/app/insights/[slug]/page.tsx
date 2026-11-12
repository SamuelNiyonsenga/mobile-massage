import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAuthed } from '@/lib/cms/auth';
import { getDoc } from '@/lib/cms/store';
import type { HomeContent, InsightsContent, SiteContent } from '@/lib/cms/defaults';
import SiteShell from '@/components/site/SiteShell';
import JsonLd from '@/components/site/JsonLd';
import { Cta } from '@/components/home/sections';
import Body from '@/components/insights/Body';
import { Card } from '@/components/insights/Cards';
import CoverArt from '@/components/insights/CoverArt';
import ReadingProgress from '@/components/insights/ReadingProgress';
import { articlePath, formatDate, parseBody, relatedTo, todayISO, tocOf, visibleArticles } from '@/lib/insights';
import { getSiteUrl } from '@/lib/siteUrl';
import { articleBlurb, articleStructuredData, articleTitleTag, pageMetadata } from '@/lib/seo';
import { waLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const preview = sp.preview === '1' && (await isAuthed());
  const [ins, site] = await Promise.all([
    getDoc<InsightsContent>('insights', preview ? 'draft' : 'published'),
    getDoc<SiteContent>('site'),
  ]);
  const a = visibleArticles(ins, { preview, today: todayISO() }).find((x) => x.slug === slug);
  if (!a) return { title: 'Guide not found', robots: { index: false, follow: false } };
  return pageMetadata({
    base: await getSiteUrl(site.seo.siteUrl),
    path: articlePath(a.slug),
    title: articleTitleTag(a),
    description: articleBlurb(a),
    image: a.cover || ins.seo.shareImage || site.seo.shareImage,
    imageAlt: a.coverAlt || a.title,
    noindex: ins.seo.noindex || sp.preview !== undefined,
    googleVerification: site.seo.googleVerification,
    type: 'article',
    publishedTime: a.date || undefined,
    modifiedTime: a.updated || a.date || undefined,
  });
}

export default async function ArticlePage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const preview = sp.preview === '1' && (await isAuthed());
  const stage = preview ? 'draft' : 'published';
  const [ins, home, site] = await Promise.all([
    getDoc<InsightsContent>('insights', stage),
    getDoc<HomeContent>('home', stage),
    getDoc<SiteContent>('site', stage),
  ]);

  const today = todayISO();
  const all = visibleArticles(ins, { preview, today });
  const a = all.find((x) => x.slug === slug);
  if (!a) notFound();

  const blocks = parseBody(a.body);
  const toc = tocOf(blocks);
  const related = relatedTo(all, a, 2);
  const base = await getSiteUrl(site.seo.siteUrl);
  const structured = !!base && !preview && !ins.seo.noindex;
  const url = base ? `${base}${articlePath(a.slug)}` : '';
  const shareText = `${a.title}${url ? ` ${url}` : ''}`;
  const back = preview ? '/insights?preview=1' : '/insights';

  return (
    <SiteShell site={site} preview={preview} editorHref="/admin/insights">
      {structured && <JsonLd data={articleStructuredData(a, ins, home, site, base)} />}
      <ReadingProgress targetId="article-body" minutes={a.minutes} />

      <header className="ah">
        <div className="wrap ah__in">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={back}>Insights</Link>
          </nav>
          {a.category && <p className="ah__cat">{a.category}</p>}
          <h1 className="ah__title">{a.title}</h1>
          {a.excerpt && <p className="ah__ex">{a.excerpt}</p>}
          <p className="meta meta--lg">
            {a.author && <span>By {a.author}</span>}
            {a.date && <time dateTime={a.date}>{formatDate(a.date)}</time>}
            <span>{a.minutes} min read</span>
          </p>
        </div>
        <div className="wrap">
          <CoverArt article={a} priority className="ah__cover" />
        </div>
      </header>

      <div className="wrap art">
        {toc.length > 1 && (
          <aside className="art__toc" aria-label="In this guide">
            <p className="art__toch">In this guide</p>
            <ol>
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>{t.text}</a>
                </li>
              ))}
            </ol>
          </aside>
        )}
        <article id="article-body" className="art__body">
          <Body blocks={blocks} />
          {a.updated && a.updated !== a.date && <p className="art__upd">Updated {formatDate(a.updated)}</p>}
          <div className="art__end">
            <span className="art__orn" aria-hidden="true" />
            <p className="art__share">
              Know someone who needs this?{' '}
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
                Share on WhatsApp
              </a>
            </p>
            <a
              className="btn btn--solid"
              href={waLink(site.contact.whatsapp, `Hello, I read "${a.title}" and I'd like to book a massage.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {site.cta.label}
            </a>
          </div>
        </article>
      </div>

      {related.length > 0 && (
        <section className="sec sec--sand isec" aria-labelledby="more-title">
          <div className="wrap">
            <h2 id="more-title" className="h2 h2--script">
              Keep reading
            </h2>
            <div className="grid grid--two">
              {related.map((r, i) => (
                <Card key={r.slug} a={r} n={i + 1} today={today} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Cta cta={ins.cta} site={site} />
    </SiteShell>
  );
}
