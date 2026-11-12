import Link from 'next/link';
import type { AboutContent, SiteContent } from '@/lib/cms/defaults';
import { waLink } from '@/lib/whatsapp';
import { paragraphs } from '@/lib/text';
import Icon from '@/components/site/Icon';
import PageHero from '@/components/site/PageHero';

export { paragraphs };

export function Intro({ intro, site }: { intro: AboutContent['intro']; site: SiteContent }) {
  return (
    <PageHero id="about-title" eyebrow={intro.script} title={intro.headline} text={intro.text}>
      <div className="phero__actions">
        <a
          href={waLink(site.contact.whatsapp, "Hello, I'd like to book a massage.")}
          className="btn btn--solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          {site.cta.label}
        </a>
        <Link href="/collection" className="btn btn--line">
          Explore the collection
        </Link>
      </div>
    </PageHero>
  );
}

export function Story({ story, image, imageAlt }: { story: AboutContent['story']; image: string; imageAlt: string }) {
  const paras = paragraphs(story.text);
  if (!story.visible || paras.length === 0) return null;
  return (
    <section className="sec" aria-labelledby="story-title">
      <div className={`wrap intro${image ? '' : ' intro--solo'}`}>
        {image && (
          <div className="arch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
          </div>
        )}
        <div className="intro__text">
          <h2 id="story-title" className="h2">
            {story.title}
          </h2>
          {paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Principles({ principles }: { principles: AboutContent['principles'] }) {
  if (!principles.visible || principles.items.length === 0) return null;
  return (
    <section className="sec sec--alt" aria-labelledby="principles-title">
      <div className="wrap">
        <div className="sec__head">
          <h2 id="principles-title" className="h2">
            {principles.title}
          </h2>
        </div>
        <ul className="glass-row glass-row--3">
          {principles.items.map((p) => (
            <li key={p.title} className="glass">
              <span className="glass__icon">
                <Icon name={p.icon} />
              </span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Therapist({ therapist }: { therapist: AboutContent['therapist'] }) {
  const bio = paragraphs(therapist.bio);
  // Stays hidden until there is something real to show.
  if (!therapist.visible || (!therapist.name.trim() && bio.length === 0)) return null;
  const hasPhoto = !!therapist.photo;
  return (
    <section className="sec" aria-labelledby="therapist-title">
      <div className={`wrap intro${hasPhoto ? '' : ' intro--solo'}`}>
        {hasPhoto && (
          <div className="arch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={therapist.photo} alt={therapist.photoAlt} loading="lazy" decoding="async" />
          </div>
        )}
        <div className="intro__text">
          {therapist.role && <p className="eyebrow">{therapist.role}</p>}
          {therapist.name.trim() && (
            <h2 id="therapist-title" className="h2">
              {therapist.name}
            </h2>
          )}
          {bio.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Credentials({ credentials }: { credentials: AboutContent['credentials'] }) {
  const items = credentials.items.map((i) => i.trim()).filter(Boolean);
  if (!credentials.visible || items.length === 0) return null;
  return (
    <section className="sec sec--alt" aria-labelledby="credentials-title">
      <div className="wrap">
        <div className="sec__head">
          <h2 id="credentials-title" className="h2">
            {credentials.title}
          </h2>
          {credentials.intro && <p className="intro-line">{credentials.intro}</p>}
        </div>
        <ul className="checks">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Area({ area, site }: { area: AboutContent['area']; site: SiteContent }) {
  if (!area.visible) return null;
  const towns = site.seo.areaServed.map((t) => t.trim()).filter(Boolean);
  const paras = paragraphs(area.text);
  return (
    <section className="sec" aria-labelledby="area-title">
      <div className="wrap narrow">
        <div className="sec__head">
          <h2 id="area-title" className="h2">
            {area.title}
          </h2>
          {paras.map((p, i) => (
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
        {area.buttonLabel && (
          <p className="more">
            <a
              href={waLink(site.contact.whatsapp, "Hello, I'd like to check if you can come to my area.")}
              className="btn btn--line"
              target="_blank"
              rel="noopener noreferrer"
            >
              {area.buttonLabel}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
