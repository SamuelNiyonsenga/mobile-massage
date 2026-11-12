import Icon from '@/components/site/Icon';
import type { Article } from '@/lib/insights';

/** Arch-shaped cover. Uses the article photo when there is one, otherwise an illustrated cover in the brand colours. */
export default function CoverArt({
  article,
  priority = false,
  className = '',
}: {
  article: Pick<Article, 'cover' | 'coverAlt' | 'tone' | 'icon' | 'title'>;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`cv cv--${article.tone} ${className}`.trim()}>
      {article.cover ? (
        <img
          src={article.cover}
          alt={article.coverAlt}
          className="cv__img"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchPriority: 'high' as const } : {})}
        />
      ) : (
        <>
          <svg className="cv__rings" viewBox="0 0 200 250" aria-hidden="true" focusable="false">
            <path d="M20 250V100a80 80 0 0 1 160 0v150" />
            <path d="M44 250V104a56 56 0 0 1 112 0v146" />
            <path d="M68 250V108a32 32 0 0 1 64 0v142" />
            <circle cx="100" cy="64" r="2.4" />
          </svg>
          <span className="cv__icon">
            <Icon name={article.icon} />
          </span>
        </>
      )}
    </div>
  );
}
