/**
 * Everything search engines and link previews need, built from CMS content.
 * Pure functions only (no Next.js imports) so they are easy to test.
 */
import type { Metadata } from 'next';
import type {
  AboutContent,
  CollectionContent,
  ContactContent,
  GalleryContent,
  HomeContent,
  InsightsContent,
  SiteContent,
} from '@/lib/cms/defaults';
import { treatmentsOf } from '@/lib/collection';
import { isFileVideo, parseEmbed } from '@/lib/embed';
import { articlePath, todayISO, visibleArticles, type Article } from '@/lib/insights';

export const BUSINESS_NAME = 'Mobile Massage Home Service - Kigali';

/** Public pages that belong in the sitemap. Add a row when a new page is built. */
export type PageDoc = 'home' | 'about' | 'collection' | 'contact' | 'gallery' | 'insights';
export const PUBLIC_PAGES: { path: string; doc: PageDoc }[] = [
  { path: '/', doc: 'home' },
  { path: '/about', doc: 'about' },
  { path: '/collection', doc: 'collection' },
  { path: '/gallery', doc: 'gallery' },
  { path: '/insights', doc: 'insights' },
  { path: '/contact', doc: 'contact' },
];

/** Keeps only the origin (https://example.com). Anything else is rejected. */
export function normalizeSiteUrl(raw: string | undefined | null): string {
  if (!raw) return '';
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    return u.origin;
  } catch {
    return '';
  }
}

/**
 * Which address to use for canonical links, share previews and the sitemap.
 * Priority: the address set in the CMS, then the SITE_URL environment variable.
 * Only while developing do we fall back to the address the browser used, because
 * trusting the request in production would let anyone spoof it.
 */
export function resolveSiteUrl(opts: {
  configured?: string;
  env?: string;
  requestOrigin?: string;
  production: boolean;
}): string {
  return (
    normalizeSiteUrl(opts.configured) ||
    normalizeSiteUrl(opts.env) ||
    (opts.production ? '' : normalizeSiteUrl(opts.requestOrigin))
  );
}

export function absoluteUrl(base: string, pathOrUrl: string): string {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (!base) return '';
  return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** '0796907746' is shown to people; search engines want +250796907746. */
export function e164(whatsapp: string): string {
  const d = whatsapp.replace(/\D/g, '');
  return d ? `+${d}` : '';
}

/** Uploaded files are named <timestamp>-<random>.<ext>, so the name tells us when they were added. */
export function uploadedAtFromName(src: string): string | null {
  const m = /\/media\/(\d{12,14})-/.exec(src);
  if (!m) return null;
  const d = new Date(Number(m[1]));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function shareImageFor(home: HomeContent, site: SiteContent): string {
  return home.seo.shareImage || site.seo.shareImage || home.hero.image || home.intro.image || '';
}

export function googleCode(raw: string): string {
  return /^[\w-]{8,100}$/.test(raw.trim()) ? raw.trim() : '';
}

/* ---------- JSON-LD ---------- */

type Json = Record<string, unknown>;

export function videoObjects(home: HomeContent, base: string): Json[] {
  return videoObjectsFrom(home.gallery.items, base);
}

export function videoObjectsFrom(
  items: { kind: string; src: string; poster: string; alt: string; caption: string }[],
  base: string,
): Json[] {
  const out: Json[] = [];
  for (const it of items) {
    if (it.kind !== 'video' || !it.src || parseEmbed(it.src) || !isFileVideo(it.src)) continue;
    const uploaded = uploadedAtFromName(it.src);
    if (!it.poster || !uploaded) continue; // Google needs a thumbnail and an upload date
    const name = it.caption || it.alt || 'Massage video';
    out.push({
      '@type': 'VideoObject',
      name,
      description: it.alt || it.caption || name,
      thumbnailUrl: absoluteUrl(base, it.poster),
      contentUrl: absoluteUrl(base, it.src),
      uploadDate: uploaded,
    });
  }
  return out;
}

/** The business itself. Both pages point at it by @id, so search engines see one business. */
function businessNode(home: HomeContent, site: SiteContent, base: string): Json {
  const business: Json = {
    '@type': 'HealthAndBeautyBusiness',
    '@id': `${base}/#business`,
    name: BUSINESS_NAME,
    url: base,
    description: home.seo.description,
    slogan: site.brand.tagline,
  };

  const image = absoluteUrl(base, shareImageFor(home, site));
  if (image) business.image = image;
  const tel = e164(site.contact.whatsapp) || e164(site.contact.phone);
  if (tel) business.telephone = tel;
  if (site.contact.email) business.email = site.contact.email;

  const areas = site.seo.areaServed.map((a) => a.trim()).filter(Boolean);
  if (areas.length) business.areaServed = areas.map((name) => ({ '@type': 'Place', name }));

  const social = site.seo.social.filter((u) => /^https?:\/\//i.test(u));
  if (social.length) business.sameAs = social;

  if (home.services.visible && home.services.items.length) {
    business.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: home.services.title,
      itemListElement: home.services.items.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, description: s.description },
      })),
    };
  }
  return business;
}

export function structuredData(home: HomeContent, site: SiteContent, base: string): Json {
  const graph: Json[] = [
    businessNode(home, site, base),
    { '@type': 'WebSite', '@id': `${base}/#website`, url: base, name: BUSINESS_NAME, publisher: { '@id': `${base}/#business` } },
  ];

  if (home.faq.visible && home.faq.items.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: home.faq.items.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: q.answer },
      })),
    });
  }
  graph.push(...videoObjects(home, base));

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** The therapist, only when a real name has been entered. */
export function therapistShown(about: AboutContent): boolean {
  return about.therapist.visible && !!about.therapist.name.trim();
}

export function aboutStructuredData(about: AboutContent, home: HomeContent, site: SiteContent, base: string): Json {
  const url = absoluteUrl(base, '/about');
  const graph: Json[] = [
    businessNode(home, site, base),
    {
      '@type': 'AboutPage',
      '@id': `${url}#page`,
      url,
      name: about.seo.title,
      description: about.seo.description,
      isPartOf: { '@id': `${base}/#website` },
      about: { '@id': `${base}/#business` },
      ...(about.intro.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(base, about.intro.image) } } : {}),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl(base, '/') },
        { '@type': 'ListItem', position: 2, name: 'About us', item: url },
      ],
    },
  ];

  if (therapistShown(about)) {
    const t = about.therapist;
    const person: Json = { '@type': 'Person', name: t.name.trim(), worksFor: { '@id': `${base}/#business` } };
    if (t.role.trim()) person.jobTitle = t.role.trim();
    if (t.photo) person.image = absoluteUrl(base, t.photo);
    const bio = t.bio.trim();
    if (bio) person.description = bio.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').slice(0, 300);
    graph.push(person);
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Safe to place inside a <script> tag: a "<" in content can never close it early. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/* ---------- Collection and Contact ---------- */

const crumbs = (base: string, name: string, path: string): Json => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl(base, '/') },
    { '@type': 'ListItem', position: 2, name, item: absoluteUrl(base, path) },
  ],
});

export function collectionStructuredData(c: CollectionContent, home: HomeContent, site: SiteContent, base: string): Json {
  const url = absoluteUrl(base, '/collection');
  const list = treatmentsOf(c);
  const graph: Json[] = [
    businessNode(home, site, base),
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      url,
      name: c.seo.title,
      description: c.seo.description,
      isPartOf: { '@id': `${base}/#website` },
      about: { '@id': `${base}/#business` },
    },
    crumbs(base, 'Collection', '/collection'),
  ];
  graph.push(...videoObjectsFrom(c.gallery.items, base));
  if (list.length) {
    graph.push({
      '@type': 'ItemList',
      name: c.menu.title,
      itemListElement: list.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Service',
          name: t.name,
          description: [t.tagline, t.description].filter(Boolean).join(' '),
          provider: { '@id': `${base}/#business` },
          ...(t.image ? { image: absoluteUrl(base, t.image) } : {}),
        },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function contactStructuredData(c: ContactContent, home: HomeContent, site: SiteContent, base: string): Json {
  const url = absoluteUrl(base, '/contact');
  const tel = e164(site.contact.phone) || e164(site.contact.whatsapp);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      businessNode(home, site, base),
      {
        '@type': 'ContactPage',
        '@id': `${url}#page`,
        url,
        name: c.seo.title,
        description: c.seo.description,
        isPartOf: { '@id': `${base}/#website` },
        about: { '@id': `${base}/#business` },
      },
      crumbs(base, 'Contact us', '/contact'),
      ...(tel
        ? [
            {
              '@type': 'ContactPoint',
              contactType: 'reservations',
              telephone: tel,
              ...(site.contact.email ? { email: site.contact.email } : {}),
              areaServed: 'Kigali',
            },
          ]
        : []),
    ],
  };
}

/* ---------- Sitemap and robots ---------- */

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const articleText = (value: string) =>
  value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function articleTitleTag(article: Article): string {
  return `${article.title} | ${BUSINESS_NAME}`;
}

export function articleBlurb(article: Article): string {
  const text = articleText(article.excerpt || article.body);
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

export function articleStructuredData(
  article: Article,
  insights: InsightsContent,
  home: HomeContent,
  site: SiteContent,
  base: string,
): Json {
  const url = absoluteUrl(base, articlePath(article.slug));
  const data: Json = {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    url,
    headline: article.title,
    description: articleBlurb(article),
    ...(article.category ? { articleSection: article.category } : {}),
    ...(article.date ? { datePublished: article.date } : {}),
    ...(article.updated || article.date ? { dateModified: article.updated || article.date } : {}),
    isPartOf: { '@type': 'Blog', '@id': `${base}/insights#blog`, name: insights.seo.title },
    publisher: { '@id': `${base}/#business` },
    ...(article.author ? { author: { '@type': 'Person', name: article.author } } : {}),
    ...(article.cover ? { image: absoluteUrl(base, article.cover) } : {}),
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [businessNode(home, site, base), data],
  };
}

export function insightsStructuredData(
  insights: InsightsContent,
  articles: Article[],
  home: HomeContent,
  site: SiteContent,
  base: string,
): Json {
  const url = absoluteUrl(base, '/insights');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      businessNode(home, site, base),
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        url,
        name: insights.seo.title,
        description: insights.seo.description,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: articles.map((article, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl(base, articlePath(article.slug)),
            name: article.title,
          })),
        },
      },
    ],
  };
}

export function galleryStructuredData(
  gallery: GalleryContent,
  home: HomeContent,
  site: SiteContent,
  base: string,
): Json {
  const url = absoluteUrl(base, '/gallery');
  const graph: Json[] = [
    businessNode(home, site, base),
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      url,
      name: gallery.seo.title,
      description: gallery.seo.description,
      isPartOf: { '@id': `${base}/#website` },
    },
    crumbs(base, 'Gallery', '/gallery'),
  ];
  const images = gallery.items
    .filter((item) => item.kind === 'image' && item.src)
    .map((item) => ({
      '@type': 'ImageObject',
      contentUrl: absoluteUrl(base, item.src),
      caption: item.caption || item.alt || undefined,
    }));
  const videos = videoObjectsFrom(gallery.items, base);
  if (images.length || videos.length) {
    graph.push({ '@type': 'ItemList', itemListElement: [...images, ...videos] });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function rssXml(opts: { base: string; insights: InsightsContent; articles: Article[] }): string {
  const items = opts.articles
    .map((article) => {
      const url = absoluteUrl(opts.base, articlePath(article.slug));
      const date = article.date ? new Date(`${article.date}T00:00:00Z`) : undefined;
      const pubDate = date && !Number.isNaN(date.getTime()) ? `<pubDate>${date.toUTCString()}</pubDate>` : '';
      return (
        '<item>' +
        `<title>${xmlEscape(article.title)}</title>` +
        `<link>${xmlEscape(url)}</link>` +
        `<guid isPermaLink="true">${xmlEscape(url)}</guid>` +
        `<description>${xmlEscape(articleBlurb(article))}</description>` +
        (article.category ? `<category>${xmlEscape(article.category)}</category>` : '') +
        pubDate +
        '</item>'
      );
    })
    .join('');
  const channelUrl = absoluteUrl(opts.base, '/insights');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0"><channel>' +
    `<title>${xmlEscape(opts.insights.seo.title)}</title>` +
    `<link>${xmlEscape(channelUrl)}</link>` +
    `<description>${xmlEscape(opts.insights.seo.description)}</description>` +
    items +
    '</channel></rss>\n'
  );
}

export function sitemapXml(opts: {
  base: string;
  home: HomeContent;
  about: AboutContent;
  /** Pages without their content document are left out */
  collection?: CollectionContent;
  contact?: ContactContent;
  gallery?: GalleryContent;
  insights?: InsightsContent;
  /** ISO date each page was last published, by page */
  lastModified?: Partial<Record<PageDoc, string>>;
}): string {
  const { base, home, about, collection, contact, gallery, insights } = opts;
  const hidden: Record<PageDoc, boolean> = {
    home: home.seo.noindex,
    about: about.seo.noindex,
    collection: !collection || collection.seo.noindex,
    contact: !contact || contact.seo.noindex,
    gallery: !gallery || gallery.seo.noindex,
    insights: !insights || insights.seo.noindex,
  };
  const pages = PUBLIC_PAGES.filter((p) => !hidden[p.doc]);

  const urls = pages.map((p) => {
    const parts = [`<loc>${xmlEscape(absoluteUrl(base, p.path))}</loc>`];
    const modified = opts.lastModified?.[p.doc];
    if (modified) parts.push(`<lastmod>${xmlEscape(modified)}</lastmod>`);

    const images = new Set<string>();
    if (p.doc === 'home') {
      const hero = absoluteUrl(base, home.hero.image);
      if (hero) images.add(hero);
      for (const it of home.gallery.items) {
        if (it.kind === 'image' && it.src) images.add(absoluteUrl(base, it.src));
      }
    } else if (p.doc === 'collection' && collection) {
      for (const t of treatmentsOf(collection)) if (t.image) images.add(absoluteUrl(base, t.image));
      if (collection.intro.image) images.add(absoluteUrl(base, collection.intro.image));
      for (const it of collection.gallery.items) {
        if (it.kind === 'image' && it.src) images.add(absoluteUrl(base, it.src));
      }
    } else if (p.doc === 'about') {
      const main = absoluteUrl(base, about.intro.image);
      if (main) images.add(main);
      if (therapistShown(about) && about.therapist.photo) images.add(absoluteUrl(base, about.therapist.photo));
    } else if (p.doc === 'gallery' && gallery) {
      for (const item of gallery.items) {
        if (item.kind === 'image' && item.src) images.add(absoluteUrl(base, item.src));
      }
    }
    for (const img of images) parts.push(`<image:image><image:loc>${xmlEscape(img)}</image:loc></image:image>`);

    if (p.doc === 'home' || (p.doc === 'collection' && collection) || (p.doc === 'gallery' && gallery)) {
      const videos =
        p.doc === 'home'
          ? videoObjects(home, base)
          : p.doc === 'collection'
            ? videoObjectsFrom(collection!.gallery.items, base)
            : videoObjectsFrom(gallery!.items, base);
      for (const v of videos) {
        parts.push(
          '<video:video>' +
            `<video:thumbnail_loc>${xmlEscape(String(v.thumbnailUrl))}</video:thumbnail_loc>` +
            `<video:title>${xmlEscape(String(v.name))}</video:title>` +
            `<video:description>${xmlEscape(String(v.description))}</video:description>` +
            `<video:content_loc>${xmlEscape(String(v.contentUrl))}</video:content_loc>` +
            '</video:video>',
        );
      }
    }
    return `<url>${parts.join('')}</url>`;
  });
  if (insights && !hidden.insights) {
    for (const article of visibleArticles(insights, { preview: false, today: todayISO() })) {
      const parts = [`<loc>${xmlEscape(absoluteUrl(base, articlePath(article.slug)))}</loc>`];
      const modified = article.updated || article.date;
      if (modified) parts.push(`<lastmod>${xmlEscape(modified)}</lastmod>`);
      if (article.cover) {
        parts.push(`<image:image><image:loc>${xmlEscape(absoluteUrl(base, article.cover))}</image:loc></image:image>`);
      }
      urls.push(`<url>${parts.join('')}</url>`);
    }
  }

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
    'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ' +
    'xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n' +
    urls.join('\n') +
    '\n</urlset>\n'
  );
}

export function robotsTxt(base: string): string {
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', 'Disallow: /*?preview='];
  if (base) lines.push('', `Sitemap: ${base}/sitemap.xml`);
  return lines.join('\n') + '\n';
}

/* ---------- Search readiness checklist (shown in the CMS) ---------- */

export interface SeoCheck {
  ok: boolean;
  text: string;
  fix?: string;
  fixHref?: string;
}

export function seoChecks(
  home: HomeContent,
  site: SiteContent,
  opts: { siteUrl: string; about?: AboutContent; collection?: CollectionContent; contact?: ContactContent },
): SeoCheck[] {
  const checks: SeoCheck[] = [];
  const add = (ok: boolean, text: string, fix?: string, fixHref?: string) => checks.push({ ok, text, fix, fixHref });

  add(
    !!opts.siteUrl,
    'Website address is set',
    'Enter your real domain under Site settings, Search and social. Without it there are no canonical links, share previews or sitemap in production.',
    '/admin/site',
  );
  add(!home.seo.noindex, 'Home page is visible to search engines', 'Turn off "Hide this page from search engines".', '/admin/home');

  const t = home.seo.title.trim().length;
  add(t >= 30 && t <= 60, 'Page title is 30 to 60 characters', `It is ${t} now.`, '/admin/home');
  const d = home.seo.description.trim().length;
  add(d >= 110 && d <= 160, 'Description is 110 to 160 characters', `It is ${d} now.`, '/admin/home');

  const areas = site.seo.areaServed.filter((a) => a.trim()).length;
  add(areas > 0, 'Towns and areas you serve are listed', 'Add your city and nearby areas so Google can match local searches.', '/admin/site');

  add(
    !!(home.seo.shareImage || site.seo.shareImage),
    'A share image is set',
    'Upload a 1200 x 630 pixel photo. Without one, link previews use the hero or welcome photo, or no picture.',
    '/admin/home',
  );
  add(!home.hero.image || !!home.hero.imageAlt.trim(), 'Hero photo has a description', 'Describe the photo in a sentence.', '/admin/home');

  const galleryItems = [...home.gallery.items, ...(opts.collection?.gallery.items ?? [])];
  const noAlt = galleryItems.filter((i) => i.src && i.kind === 'image' && !i.alt.trim()).length;
  add(noAlt === 0, 'Every gallery photo has a description', `${noAlt} photo${noAlt === 1 ? '' : 's'} missing one (Home or Collection gallery).`, '/admin/collection');

  const noPoster = galleryItems.filter((i) => i.src && i.kind === 'video' && isFileVideo(i.src) && !i.poster).length;
  add(
    noPoster === 0,
    'Uploaded videos have a cover photo',
    `${noPoster} video${noPoster === 1 ? '' : 's'} missing one. Google only lists videos that have a cover.`,
    '/admin/home',
  );

  const about = opts.about;
  if (about) {
    const at = about.seo.title.trim().length;
    const ad = about.seo.description.trim().length;
    add(at >= 30 && at <= 60 && ad >= 110 && ad <= 160, 'About page title and description are the right length', `Title is ${at}, description is ${ad}.`, '/admin/about');
    add(
      therapistShown(about) && about.therapist.bio.trim().length > 0,
      'About page introduces the therapist (name and bio)',
      'People book someone they can picture. Add your name, a photo and a short bio.',
      '/admin/about',
    );
    add(
      about.credentials.items.some((i) => i.trim()),
      'About page lists real qualifications',
      'Add your certificates and training. Only list what is true.',
      '/admin/about',
    );
  }

  if (opts.collection) {
    const list = treatmentsOf(opts.collection);
    const priced = list.filter((t) => t.opts.some((o) => o.price)).length;
    add(list.length >= 3, 'Collection lists at least 3 treatments', `${list.length} now.`, '/admin/collection');
    add(
      list.length > 0 && priced === list.length,
      'Every treatment shows a length and price',
      `${list.length - priced} treatment(s) have none. Visitors often leave when they cannot see prices.`,
      '/admin/collection',
    );
    const noAlt = list.filter((t) => t.image && !t.imageAlt.trim()).length;
    add(noAlt === 0, 'Every treatment photo has a description', `${noAlt} photo(s) are missing one.`, '/admin/collection');
    const ct = opts.collection.seo.title.trim().length;
    const cd = opts.collection.seo.description.trim().length;
    add(ct >= 30 && ct <= 60 && cd >= 110 && cd <= 160, 'Collection title and description are the right length', `Title is ${ct}, description is ${cd}.`, '/admin/collection');
  }
  if (opts.contact) {
    const ct = opts.contact.seo.title.trim().length;
    const cd = opts.contact.seo.description.trim().length;
    add(ct >= 30 && ct <= 60 && cd >= 110 && cd <= 160, 'Contact title and description are the right length', `Title is ${ct}, description is ${cd}.`, '/admin/contact');
    add(!!site.contact.email.trim(), 'An email address is listed', 'Some clients prefer email. Add one under Site settings, Contact details.', '/admin/site');
  }

  add(!!(site.contact.whatsapp || site.contact.phone), 'A phone or WhatsApp number is set', undefined, '/admin/site');
  add(site.seo.social.filter(Boolean).length > 0, 'At least one social profile is linked', 'Add Instagram, Facebook or TikTok links.', '/admin/site');
  add(!!googleCode(site.seo.googleVerification), 'Google Search Console is verified', 'Paste the verification code, then submit your sitemap in Search Console.', '/admin/site');

  return checks;
}

/* ---------- Page metadata ---------- */

export function pageMetadata(opts: {
  base: string;
  path: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  noindex: boolean;
  googleVerification?: string;
  feed?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const url = opts.base ? absoluteUrl(opts.base, opts.path) : undefined;
  const image = absoluteUrl(opts.base, opts.image) || undefined;
  const verification = googleCode(opts.googleVerification ?? '');

  return {
    metadataBase: opts.base ? new URL(opts.base) : undefined,
    title: { absolute: opts.title },
    description: opts.description,
    alternates: url
      ? {
          canonical: url,
          ...(opts.feed ? { types: { 'application/rss+xml': opts.feed } } : {}),
        }
      : undefined,
    robots: opts.noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        },
    openGraph: {
      type: opts.type ?? 'website',
      ...(opts.type === 'article' && opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.type === 'article' && opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
      siteName: BUSINESS_NAME,
      title: opts.title,
      description: opts.description,
      url,
      images: image ? [{ url: image, alt: opts.imageAlt || BUSINESS_NAME }] : undefined,
    } as Metadata['openGraph'],
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: opts.title,
      description: opts.description,
      images: image ? [image] : undefined,
    },
    verification: verification ? { google: verification } : undefined,
    formatDetection: { telephone: false },
  };
}
