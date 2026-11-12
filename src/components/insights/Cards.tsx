import Link from 'next/link';
import { articlePath, formatDate, isLive, type Article } from '@/lib/insights';
import CoverArt from './CoverArt';

function StatusTag({ a, today }: { a: Article; today: string }) {
  if (isLive(a, today)) return null;
  return <span className="tag tag--draft">{a.status === 'draft' ? 'Draft' : `Scheduled ${formatDate(a.date)}`}</span>;
}

/** Large lead story */
export function Lead({ a, today }: { a: Article; today: string }) {
  return (
    <article className="lead">
      <Link href={articlePath(a.slug)} className="lead__cover" aria-label={a.title} tabIndex={-1}>
        <CoverArt article={a} priority />
      </Link>
      <div className="lead__text">
        <p className="kicker">
          <span>Featured</span>
          {a.category && <span>{a.category}</span>}
          <StatusTag a={a} today={today} />
        </p>
        <h2 className="lead__title">
          <Link href={articlePath(a.slug)}>{a.title}</Link>
        </h2>
        {a.excerpt && <p className="lead__ex">{a.excerpt}</p>}
        <p className="meta">
          {a.date && <time dateTime={a.date}>{formatDate(a.date)}</time>}
          <span>{a.minutes} min read</span>
        </p>
        <Link href={articlePath(a.slug)} className="more">
          Read the guide <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

/** Card in the staggered grid */
export function Card({ a, n, today }: { a: Article; n: number; today: string }) {
  return (
    <article className="card">
      <Link href={articlePath(a.slug)} className="card__cover" aria-label={a.title} tabIndex={-1}>
        <CoverArt article={a} />
        <span className="card__no" aria-hidden="true">
          {String(n).padStart(2, '0')}
        </span>
      </Link>
      <p className="kicker">
        {a.category && <span>{a.category}</span>}
        <StatusTag a={a} today={today} />
      </p>
      <h3 className="card__title">
        <Link href={articlePath(a.slug)}>{a.title}</Link>
      </h3>
      {a.excerpt && <p className="card__ex">{a.excerpt}</p>}
      <p className="meta">
        {a.date && <time dateTime={a.date}>{formatDate(a.date)}</time>}
        <span>{a.minutes} min read</span>
      </p>
    </article>
  );
}
