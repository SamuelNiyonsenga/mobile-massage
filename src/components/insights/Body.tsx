import Link from 'next/link';
import { Fragment } from 'react';
import type { Block, Inline } from '@/lib/insights';

function Inlines({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.t) {
          case 'text':
            return <Fragment key={i}>{n.v}</Fragment>;
          case 'b':
            return (
              <strong key={i}>
                <Inlines nodes={n.c} />
              </strong>
            );
          case 'i':
            return (
              <em key={i}>
                <Inlines nodes={n.c} />
              </em>
            );
          case 'a':
            return n.href.startsWith('/') ? (
              <Link key={i} href={n.href}>
                <Inlines nodes={n.c} />
              </Link>
            ) : (
              <a key={i} href={n.href} {...(n.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <Inlines nodes={n.c} />
              </a>
            );
        }
      })}
    </>
  );
}

export default function Body({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'h2':
            return (
              <h2 key={i} id={b.id}>
                {b.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={i} id={b.id}>
                {b.text}
              </h3>
            );
          case 'p':
            return (
              <p key={i}>
                <Inlines nodes={b.c} />
              </p>
            );
          case 'ul':
            return (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <Inlines nodes={it} />
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <Inlines nodes={it} />
                  </li>
                ))}
              </ol>
            );
          case 'quote':
            return (
              <blockquote key={i}>
                <p>
                  <Inlines nodes={b.c} />
                </p>
              </blockquote>
            );
          case 'img':
            return (
              <figure key={i}>
                <img src={b.src} alt={b.alt} loading="lazy" decoding="async" />
                {b.alt && <figcaption>{b.alt}</figcaption>}
              </figure>
            );
          case 'hr':
            return <hr key={i} className="art__orn" />;
        }
      })}
    </>
  );
}
