import Link from 'next/link';
import { DOCS, type DocKey } from '@/lib/cms/schemas';
import { getDoc, hasUnpublished } from '@/lib/cms/store';
import type { AboutContent, CollectionContent, ContactContent, HomeContent, SiteContent } from '@/lib/cms/defaults';
import { normalizeSiteUrl, seoChecks } from '@/lib/seo';

export default async function Dashboard() {
  const keys = Object.keys(DOCS) as DocKey[];
  const [status, home, about, collection, contact, site] = await Promise.all([
    Promise.all(keys.map((k) => hasUnpublished(k))),
    getDoc<HomeContent>('home'),
    getDoc<AboutContent>('about'),
    getDoc<CollectionContent>('collection'),
    getDoc<ContactContent>('contact'),
    getDoc<SiteContent>('site'),
  ]);

  // Search engines only see what is published, so the checklist reads the published version.
  const siteUrl = normalizeSiteUrl(site.seo.siteUrl) || normalizeSiteUrl(process.env.SITE_URL);
  const checks = seoChecks(home, site, { siteUrl, about, collection, contact });
  const todo = checks.filter((c) => !c.ok);

  return (
    <main className="adm-main">
      <h1>Content</h1>
      <p className="adm-lead">
        Edit a page, save your changes as a draft, preview them, then publish when you are happy.
        Visitors only see published content.
      </p>
      <ul className="adm-docs">
        {keys.map((k, i) => (
          <li key={k} className="adm-doc">
            <div>
              <h2>
                <Link href={`/admin/${k}`}>{DOCS[k].title}</Link>
              </h2>
              <p>{DOCS[k].description}</p>
            </div>
            <div className="adm-doc__side">
              {status[i] ? (
                <span className="adm-pill adm-pill--warn">Unpublished changes</span>
              ) : (
                <span className="adm-pill">Live</span>
              )}
              <Link className="adm-btn" href={`/admin/${k}`}>
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <p className="adm-note">
        Photos and videos live in the <Link href="/admin/media">media library</Link>.
      </p>

      <section className="seo" aria-labelledby="seo-title">
        <h2 id="seo-title">Search readiness</h2>
        <p className="seo__sum">
          {todo.length === 0
            ? 'Everything we can check from here is in place.'
            : `${checks.length - todo.length} of ${checks.length} done. ${todo.length} left to improve your ranking on Google.`}
        </p>
        <ul className="seo__list">
          {checks.map((c) => (
            <li key={c.text} className={c.ok ? 'is-ok' : 'is-todo'}>
              <span className="seo__mark" aria-hidden="true">
                {c.ok ? '✓' : '•'}
              </span>
              <span>
                {c.text}
                <span className="sr-only">{c.ok ? ': done' : ': to do'}</span>
                {!c.ok && c.fix && (
                  <span className="seo__fix">
                    {c.fix}
                    {c.fixHref && (
                      <>
                        {' '}
                        <Link href={c.fixHref}>Open</Link>
                      </>
                    )}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="adm-note">
          Two things matter most for local searches and live outside this website: a free Google Business Profile (set
          it as a service-area business, so you do not need to show a street address), and asking happy clients to
          leave a review on it.
        </p>
      </section>

    </main>
  );
}
