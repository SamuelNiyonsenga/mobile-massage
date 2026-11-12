import Link from 'next/link';
import type { SiteContent } from '@/lib/cms/defaults';
import { waLink } from '@/lib/whatsapp';
import { Brand } from './Header';

export default function Footer({ site }: { site: SiteContent }) {
  const { contact } = site;
  const tel = contact.phone.replace(/[^\d+]/g, '');

  return (
    <footer className="ftr">
      <div className="wrap ftr__grid">
        <div className="ftr__about">
          <Link href="/" className="brand" aria-label={`${site.brand.name}, home`}>
            <Brand site={site} />
          </Link>
          <p className="ftr__tag">{site.brand.tagline}</p>
          <p>{site.footer.blurb}</p>
        </div>

        {site.footer.groups.map((g) => (
          <nav key={g.title} aria-label={g.title} className="ftr__col">
            <h2>{g.title}</h2>
            <ul>
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="ftr__col">
          <h2>Contact</h2>
          <ul>
            {contact.phone && (
              <li>
                <a href={`tel:${tel}`}>{contact.phone}</a>
              </li>
            )}
            {contact.whatsapp && (
              <li>
                <a href={waLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer">
                  Message on WhatsApp
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            )}
            {contact.hours && <li>{contact.hours}</li>}
            {contact.serviceArea && <li>{contact.serviceArea}</li>}
          </ul>
        </div>
      </div>
      <div className="wrap ftr__legal">
        <p>
          &copy; {new Date().getFullYear()} {site.brand.name}
          {site.brand.descriptor ? ` ${site.brand.descriptor}` : ''}. {site.footer.legal}
        </p>
      </div>
    </footer>
  );
}
