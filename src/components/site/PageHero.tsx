import type { ReactNode } from 'react';

/** Shared heading band for About, Collection and Contact: a dark, softly lit stage with an optional photo behind. */
export default function PageHero({
  eyebrow,
  title,
  text,
  image,
  imageAlt,
  id,
  children,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  image?: string;
  imageAlt?: string;
  id: string;
  children?: ReactNode;
}) {
  return (
    <section className="phero" aria-labelledby={id}>
      <Backdrop image={image} alt={imageAlt} />
      <div className="wrap phero__in">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 id={id} className="phero__title">
          {title}
        </h1>
        {text && <p className="phero__text">{text}</p>}
        {children}
      </div>
    </section>
  );
}

/** Photo with a dark veil, or the built-in glow and rings when there is no photo. */
export function Backdrop({
  image,
  alt = '',
  priority = false,
  children,
}: {
  image?: string;
  alt?: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="bd" aria-hidden={image && alt ? undefined : true}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={alt} className="bd__img" loading={priority ? 'eager' : 'lazy'} decoding="async" {...(priority ? { fetchPriority: 'high' as const } : {})} />
      ) : (
        <>
          <span className="bd__ring bd__ring--1" />
          <span className="bd__ring bd__ring--2" />
          <span className="bd__ring bd__ring--3" />
        </>
      )}
      {children}
      <span className="bd__veil" />
    </div>
  );
}
