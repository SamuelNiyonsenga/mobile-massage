import Link from 'next/link';
import type { HomeContent, IconName, SiteContent } from '@/lib/cms/defaults';
import { waLink } from '@/lib/whatsapp';
import { lines, paragraphs } from '@/lib/text';
import { bookingMessage } from '@/lib/collection';
import Icon from '@/components/site/Icon';
import { Backdrop } from '@/components/site/PageHero';
import BookingPicker from './BookingPicker';
import HeroVideo from './HeroVideo';

export function Hero({ hero, whatsapp }: { hero: HomeContent['hero']; whatsapp: string }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Backdrop image={hero.image} alt={hero.imageAlt} priority>
        {hero.video && /\.(mp4|webm)(\?|$)/i.test(hero.video) && <HeroVideo src={hero.video} poster={hero.image} />}
      </Backdrop>
      <div className="wrap hero__in">
        {hero.eyebrow && <p className="eyebrow eyebrow--lg">{hero.eyebrow}</p>}
        <h1 id="hero-title" className="hero__title">
          {hero.headline}
        </h1>
        {hero.script && <p className="hero__sub">{hero.script}</p>}
        {hero.subheadline && <p className="hero__lead">{hero.subheadline}</p>}
        <BookingPicker {...hero.picker} whatsapp={whatsapp} />
        <p className="hero__foot">
          {hero.quote && <span>{hero.quote}</span>}
          {hero.secondaryCta.label && <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>}
        </p>
      </div>
    </section>
  );
}

export function Intro({ intro }: { intro: HomeContent['intro'] }) {
  const paras = paragraphs(intro.text);
  if (!intro.visible || (!intro.title && paras.length === 0)) return null;
  return (
    <section className="sec" aria-labelledby="intro-title">
      <div className={`wrap intro${intro.image ? '' : ' intro--solo'}`}>
        {intro.image && (
          <div className="arch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={intro.image} alt={intro.imageAlt} loading="lazy" decoding="async" />
          </div>
        )}
        <div className="intro__text">
          {intro.eyebrow && <p className="eyebrow">{intro.eyebrow}</p>}
          <h2 id="intro-title" className="h2">
            {intro.title}
          </h2>
          {paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Band({ band }: { band: HomeContent['band'] }) {
  if (!band.visible) return null;
  const headline = lines(band.headline);
  return (
    <section className="band" aria-labelledby="band-title">
      <Backdrop image={band.image} alt={band.imageAlt} />
      <div className="wrap band__in">
        <h2 id="band-title" className="band__title">
          {headline.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </h2>
        {band.text && <p className="band__text">{band.text}</p>}
        {band.cta.label && (
          <Link href={band.cta.href || '/collection'} className="btn btn--line">
            {band.cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}

export function Places({ places, whatsapp }: { places: HomeContent['places']; whatsapp: string }) {
  if (!places.visible || places.items.length === 0) return null;
  return (
    <section className="sec" aria-labelledby="places-title">
      <div className="wrap">
        <div className="sec__head">
          <h2 id="places-title" className="h2">
            {places.title}
          </h2>
          {places.intro && <p className="intro-line">{places.intro}</p>}
        </div>
        <ul className="places">
          {places.items.map((p) => (
            <li key={p.title} className="place">
              <Backdrop image={p.image} alt={p.imageAlt} />
              <div className="place__body">
                <span className="place__icon">
                  <Icon name={p.icon} />
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                {places.buttonLabel && (
                  <a
                    href={waLink(whatsapp, `Hello, I'd like to book a massage. Place: ${p.title}.`)}
                    className="btn btn--line"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${places.buttonLabel}: ${p.title}`}
                  >
                    {places.buttonLabel}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const WHY_ICONS: IconName[] = ['pin', 'lotus', 'home', 'body'];

export function Why({ why }: { why: HomeContent['why'] }) {
  if (!why.visible) return null;
  const points = why.points.map((p) => p.trim()).filter(Boolean);
  return (
    <section className="why" aria-labelledby="why-title">
      <Backdrop image={why.image} alt={why.imageAlt} />
      <div className="wrap why__in">
        <div className="sec__head">
          <h2 id="why-title" className="h2">
            {why.title}
          </h2>
          {why.text && <p className="intro-line">{why.text}</p>}
        </div>
        {points.length > 0 && (
          <ul className="glass-row">
            {points.map((p, i) => (
              <li key={p} className="glass">
                <span className="glass__icon">
                  <Icon name={WHY_ICONS[i % WHY_ICONS.length]} />
                </span>
                <p>{p}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function Services({ services, whatsapp }: { services: HomeContent['services']; whatsapp: string }) {
  if (!services.visible) return null;
  return (
    <section className="sec sec--alt" id="services" aria-labelledby="services-title">
      <div className="wrap">
        <div className="sec__head">
          <h2 id="services-title" className="h2">
            {services.title}
          </h2>
          {services.intro && <p className="intro-line">{services.intro}</p>}
        </div>
        <ol className="menu">
          {services.items.map((s, i) => (
            <li key={s.name} className="menu__row">
              <span className="menu__no" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="menu__main">
                <h3>{s.name}</h3>
                <p>{s.description}</p>
              </div>
              <div className="menu__buy">
                {s.price && <p className="menu__price">{s.price}</p>}
                <a
                  href={waLink(whatsapp, bookingMessage(s.name))}
                  className="btn btn--line btn--sm"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Book ${s.name} on WhatsApp`}
                >
                  Book
                </a>
              </div>
            </li>
          ))}
        </ol>
        {services.moreLabel && (
          <p className="more">
            <Link href="/collection" className="btn btn--solid">
              {services.moreLabel}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

export function Process({ process }: { process: HomeContent['process'] }) {
  if (!process.visible || process.steps.length === 0) return null;
  return (
    <section className="sec" id="booking" aria-labelledby="process-title">
      <div className="wrap">
        <div className="sec__head">
          <h2 id="process-title" className="h2">
            {process.title}
          </h2>
          {process.intro && <p className="intro-line">{process.intro}</p>}
        </div>
        <ol className="steps">
          {process.steps.map((s, i) => (
            <li key={s.title}>
              <span className="steps__no" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Testimonials({ testimonials }: { testimonials: HomeContent['testimonials'] }) {
  if (!testimonials.visible || testimonials.items.length === 0) return null;
  return (
    <section className="sec sec--alt" aria-labelledby="reviews-title">
      <div className="wrap">
        <div className="sec__head">
          <h2 id="reviews-title" className="h2">
            {testimonials.title}
          </h2>
        </div>
        <div className="quotes">
          {testimonials.items.map((q, i) => (
            <figure className="quote glass" key={`${q.name}-${i}`}>
              <blockquote>{q.quote}</blockquote>
              <figcaption>
                {q.name}
                {q.detail && <span>{q.detail}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq({ faq }: { faq: HomeContent['faq'] }) {
  if (!faq.visible || faq.items.length === 0) return null;
  return (
    <section className="sec" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-wrap">
        <div className="sec__head">
          <h2 id="faq-title" className="h2">
            {faq.title}
          </h2>
        </div>
        <div className="faq">
          {faq.items.map((q) => (
            <details key={q.question}>
              <summary>{q.question}</summary>
              <p>{q.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 48 48" width="26" height="26" aria-hidden="true" focusable="false">
      <path
        d="M24 6.5a17.4 17.4 0 0 0-14.9 26.4L7 41l8.3-2.1A17.4 17.4 0 1 0 24 6.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M18.6 17.2c.6-.6 1.5-.5 1.9.3l1.3 2.8c.2.5.1 1-.3 1.4l-1 1.1c1.1 2.2 2.9 4 5.2 5.2l1.1-1.1c.4-.4.9-.5 1.4-.3l2.7 1.3c.8.4 1 1.3.4 2-1.3 1.6-3.3 2.2-5.2 1.6-4.8-1.6-8-4.8-9.6-9.6-.5-1.8.2-3.5 2.1-4.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Cta({ cta, site }: { cta: HomeContent['cta']; site: SiteContent }) {
  if (!cta.visible) return null;
  const { phone, whatsapp } = site.contact;
  return (
    <section className="cta" aria-labelledby="cta-title">
      <Backdrop image={cta.image} />
      <div className="wrap cta__in">
        <h2 id="cta-title" className="h2">
          {cta.title}
        </h2>
        {cta.text && <p className="intro-line">{cta.text}</p>}
        <div className="cta__act">
          <a
            href={waLink(whatsapp, "Hello, I'd like to book a massage.")}
            className="btn btn--solid btn--lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppGlyph />
            {cta.buttonLabel}
          </a>
          {phone && (
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="cta__phone">
              or call {phone}
            </a>
          )}
        </div>
        {cta.thanks && <p className="cta__thanks">{cta.thanks}</p>}
      </div>
    </section>
  );
}
