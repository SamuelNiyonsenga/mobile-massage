'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { SiteContent } from '@/lib/cms/defaults';
import { waLink } from '@/lib/whatsapp';

/** Emblem: a lotus inside a fine ring, drawn with hairlines to match the rest of the site. */
export function Emblem({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="22.5" />
      <path d="M24 9c-4.6 5.6-4.6 11.4 0 17.4C28.6 20.4 28.6 14.6 24 9Z" />
      <path d="M24 26.4c-6.6-1-11-5.4-11-11 5.6 0 9.4 3.6 11 11Z" />
      <path d="M24 26.4c6.6-1 11-5.4 11-11-5.6 0-9.4 3.6-11 11Z" />
      <path d="M15 33h18" strokeLinecap="round" />
      <path d="M18 37h12" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}

export function Brand({ site }: { site: SiteContent }) {
  return (
    <>
      <span className="brand__emblem">
        <Emblem />
      </span>
      <span className="brand__text">
        <span className="brand__name">{site.brand.name}</span>
        {site.brand.descriptor && <span className="brand__sub">{site.brand.descriptor}</span>}
      </span>
    </>
  );
}

/** The page itself, or any page beneath it. Links with a #section never count as "current". */
export function isCurrent(href: string, pathname: string) {
  if (!href.startsWith('/') || href.includes('#')) return false;
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({ site }: { site: SiteContent }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);
  const { contact } = site;
  const tel = contact.phone.replace(/[^\d+]/g, '');

  return (
    <>
      <div className="util">
        <div className="wrap util__in">
          <p className="util__left">
            {contact.email ? (
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            ) : (
              <span>{site.brand.descriptor || site.brand.tagline}</span>
            )}
          </p>
          <p className="util__right">
            {contact.whatsapp && (
              <a href={waLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            )}
            {contact.phone && <a href={`tel:${tel}`}>Call {contact.phone}</a>}
          </p>
        </div>
      </div>

      <header className="hdr">
        <div className="wrap hdr__in">
          <Link href="/" className="brand" onClick={close} aria-label={`${site.brand.name}, home`}>
            <Brand site={site} />
          </Link>

          <nav id="main-nav" className={`hdr__nav${open ? ' is-open' : ''}`} aria-label="Main">
            <ul>
              {site.nav.items.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} onClick={close} aria-current={isCurrent(l.href, pathname) ? 'page' : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href={waLink(contact.whatsapp, "Hello, I'd like to book a massage.")}
              className="btn btn--line hdr__cta"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              {site.cta.label}
            </a>
          </nav>

          <button
            type="button"
            className="hdr__toggle"
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>
    </>
  );
}
