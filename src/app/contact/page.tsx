import type { Metadata } from 'next';
import { isAuthed } from '@/lib/cms/auth';
import { getDoc } from '@/lib/cms/store';
import type { CollectionContent, ContactContent, HomeContent, SiteContent } from '@/lib/cms/defaults';
import SiteShell from '@/components/site/SiteShell';
import JsonLd from '@/components/site/JsonLd';
import PageHero from '@/components/site/PageHero';
import ContactForm from '@/components/contact/ContactForm';
import { Cta } from '@/components/home/sections';
import { treatmentsOf } from '@/lib/collection';
import { paragraphs } from '@/lib/text';
import { getSiteUrl } from '@/lib/siteUrl';
import { contactStructuredData, pageMetadata } from '@/lib/seo';
import { waLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

type Search = Promise<{ preview?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const [c, site, sp] = await Promise.all([getDoc<ContactContent>('contact'), getDoc<SiteContent>('site'), searchParams]);
  return pageMetadata({
    base: await getSiteUrl(site.seo.siteUrl),
    path: '/contact',
    title: c.seo.title,
    description: c.seo.description,
    image: c.seo.shareImage || site.seo.shareImage || c.intro.image,
    imageAlt: c.intro.imageAlt,
    noindex: c.seo.noindex || sp.preview !== undefined,
    googleVerification: site.seo.googleVerification,
  });
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="detail">
      <p className="detail__label">{label}</p>
      <div className="detail__value">{children}</div>
    </li>
  );
}

export default async function ContactPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const preview = sp.preview === '1' && (await isAuthed());
  const stage = preview ? 'draft' : 'published';
  const [c, collection, home, site] = await Promise.all([
    getDoc<ContactContent>('contact', stage),
    getDoc<CollectionContent>('collection', stage),
    getDoc<HomeContent>('home', stage),
    getDoc<SiteContent>('site', stage),
  ]);

  const { contact } = site;
  const tel = contact.phone.replace(/[^\d+]/g, '');
  const towns = site.seo.areaServed.map((t) => t.trim()).filter(Boolean);
  const treatments = treatmentsOf(collection).map((t) => t.name);
  const base = await getSiteUrl(site.seo.siteUrl);
  const structured = !!base && !preview && !c.seo.noindex;

  return (
    <SiteShell site={site} preview={preview} editorHref="/admin/contact">
      {structured && <JsonLd data={contactStructuredData(c, home, site, base)} />}
      <PageHero id="contact-title" eyebrow={c.intro.eyebrow} title={c.intro.headline} text={c.intro.text} image={c.intro.image} imageAlt={c.intro.imageAlt} />

      <section className="sec" aria-label="Contact and booking">
        <div className="wrap contact">
          <div className="contact__side">
            <h2 className="h2 h2--left">{c.details.title}</h2>
            {c.details.text && <p className="intro-line intro-line--left">{c.details.text}</p>}
            <ul className="details">
              {contact.whatsapp && (
                <Detail label="WhatsApp">
                  <a href={waLink(contact.whatsapp, "Hello, I'd like to book a massage.")} target="_blank" rel="noopener noreferrer">
                    Message us
                  </a>
                </Detail>
              )}
              {contact.phone && (
                <Detail label="Call">
                  <a href={`tel:${tel}`}>{contact.phone}</a>
                </Detail>
              )}
              {contact.email && (
                <Detail label="Email">
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </Detail>
              )}
              {contact.hours && <Detail label="Hours">{contact.hours}</Detail>}
              {contact.serviceArea && <Detail label="Where">{contact.serviceArea}</Detail>}
            </ul>
          </div>

          <ContactForm
            whatsapp={contact.whatsapp}
            treatments={treatments}
            places={home.hero.picker.places}
            title={c.form.title}
            text={c.form.text}
            buttonLabel={c.form.buttonLabel}
            notePlaceholder={c.form.notePlaceholder}
          />
        </div>
      </section>

      {c.areas.visible && (
        <section className="sec sec--alt" aria-labelledby="areas-title">
          <div className="wrap narrow">
            <div className="sec__head">
              <h2 id="areas-title" className="h2">
                {c.areas.title}
              </h2>
              {paragraphs(c.areas.text).map((p, i) => (
                <p key={i} className="intro-line">
                  {p}
                </p>
              ))}
            </div>
            {towns.length > 0 && (
              <ul className="towns" aria-label="Areas served">
                {towns.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <Cta cta={c.cta} site={site} />
    </SiteShell>
  );
}
