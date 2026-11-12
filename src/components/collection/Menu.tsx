import type { CollectionContent, SiteContent } from '@/lib/cms/defaults';
import { bookingMessage, type Group, type Treatment } from '@/lib/collection';
import { waLink } from '@/lib/whatsapp';
import Icon from '@/components/site/Icon';

function TreatmentCard({ t, n, whatsapp, flip }: { t: Treatment; n: number; whatsapp: string; flip: boolean }) {
  const book = (opt?: string) => waLink(whatsapp, bookingMessage(t.name, opt));
  return (
    <article className={`tr${flip ? ' tr--flip' : ''}${t.image ? '' : ' tr--noimg'}`} id={t.slug} aria-labelledby={`${t.slug}-title`}>
      <div className="tr__media">
        {t.image ? (
          <div className="arch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.image} alt={t.imageAlt} loading="lazy" decoding="async" />
          </div>
        ) : (
          <span className="tr__medal" aria-hidden="true">
            <Icon name={t.icon} />
          </span>
        )}
        <span className="tr__no" aria-hidden="true">
          {String(n).padStart(2, '0')}
        </span>
      </div>

      <div className="tr__body">
        <h3 id={`${t.slug}-title`} className="tr__name">
          {t.name}
        </h3>
        {t.tagline && <p className="tr__tag">{t.tagline}</p>}
        {t.description && <p className="tr__desc">{t.description}</p>}
        {t.points.length > 0 && (
          <ul className="tr__points" aria-label={`${t.name} is good for`}>
            {t.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        {t.opts.length > 0 ? (
          <ul className="opts" aria-label={`${t.name} lengths and prices`}>
            {t.opts.map((o) => (
              <li key={o.label} className="opts__row">
                <span className="opts__label">{o.label}</span>
                <span className="opts__dots" aria-hidden="true" />
                {o.price && <span className="opts__price">{o.price}</span>}
                <a
                  href={book(o.label)}
                  className="btn btn--line btn--sm"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Book ${t.name}, ${o.label}, on WhatsApp`}
                >
                  Book
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="tr__cta">
            <a href={book()} className="btn btn--solid" target="_blank" rel="noopener noreferrer" aria-label={`Book ${t.name} on WhatsApp`}>
              Book this treatment
            </a>
            <span>Length and price confirmed on WhatsApp</span>
          </p>
        )}
      </div>
    </article>
  );
}

export function Menu({ menu, groups, whatsapp }: { menu: CollectionContent['menu']; groups: Group[]; whatsapp: string }) {
  if (groups.length === 0) return null;
  const named = groups.filter((g) => g.name);
  let n = 0;
  return (
    <section className="sec" aria-labelledby="menu-title">
      <div className="wrap">
        <div className="sec__head">
          <h2 id="menu-title" className="h2">
            {menu.title}
          </h2>
          {menu.intro && <p className="intro-line">{menu.intro}</p>}
        </div>

        {named.length > 1 && (
          <nav className="jump" aria-label="Jump to a group">
            {named.map((g) => (
              <a key={g.slug} href={`#group-${g.slug}`} className="pill">
                {g.name}
                <span>{g.items.length}</span>
              </a>
            ))}
          </nav>
        )}

        {groups.map((g) => (
          <div key={g.slug} className="grp" id={`group-${g.slug}`}>
            {g.name && (
              <h3 className="grp__title">
                <span>{g.name}</span>
              </h3>
            )}
            <div className="grp__list">
              {g.items.map((t, i) => {
                n += 1;
                return <TreatmentCard key={t.slug} t={t} n={n} whatsapp={whatsapp} flip={i % 2 === 1} />;
              })}
            </div>
          </div>
        ))}

        {menu.note && <p className="menu-note">{menu.note}</p>}
      </div>
    </section>
  );
}

export function Guide({ guide, site }: { guide: CollectionContent['guide']; site: SiteContent }) {
  const rows = guide.items.filter((r) => r.title.trim());
  if (!guide.visible || rows.length === 0) return null;
  return (
    <section className="sec sec--alt" aria-labelledby="guide-title">
      <div className="wrap">
        <div className="sec__head">
          <h2 id="guide-title" className="h2">
            {guide.title}
          </h2>
          {guide.text && <p className="intro-line">{guide.text}</p>}
        </div>
        <ul className="guide">
          {rows.map((r) => (
            <li key={r.title} className="glass">
              <p className="guide__q">{r.title}</p>
              <span className="guide__arrow" aria-hidden="true">
                &darr;
              </span>
              <p className="guide__a">{r.text}</p>
            </li>
          ))}
        </ul>
        <p className="more">
          <a
            href={waLink(site.contact.whatsapp, "Hello, I'm not sure which massage to choose. Can you help me?")}
            className="btn btn--line"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask me to help you choose
          </a>
        </p>
      </div>
    </section>
  );
}

