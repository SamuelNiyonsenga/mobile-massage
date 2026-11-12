'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { parseEmbed } from '@/lib/embed';
import type { GItem, GTopic } from '@/lib/gallery';
import { slugify } from '@/lib/insights';

export default function GalleryWall({ items, topics }: { items: GItem[]; topics: GTopic[] }) {
  const [topic, setTopic] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const swipe = useRef<number | null>(null);

  const shown = topic ? items.filter((i) => slugify(i.topic) === topic) : items;
  const current = open === null ? null : shown[open] ?? null;

  const show = (i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const step = (d: number) => setOpen((o) => (o === null || shown.length === 0 ? o : (o + d + shown.length) % shown.length));

  // Warm the next and previous photos so stepping through feels instant.
  useEffect(() => {
    if (open === null) return;
    for (const d of [1, -1]) {
      const it = shown[(open + d + shown.length) % shown.length];
      if (it && it.kind === 'image') new Image().src = it.src;
    }
  }, [open, shown]);

  const pick = (slug: string) => {
    setTopic(slug);
    setOpen(null);
  };

  return (
    <div className="gw">
      {topics.length > 0 && (
        <div className="gw__bar">
          <div className="gw__chips" role="group" aria-label="Filter by topic">
            <button type="button" className="tchip" aria-pressed={topic === ''} onClick={() => pick('')}>
              All <span>{items.length}</span>
            </button>
            {topics.map((t) => (
              <button key={t.slug} type="button" className="tchip" aria-pressed={topic === t.slug} onClick={() => pick(t.slug)}>
                {t.name} <span>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="sr" role="status" aria-live="polite">
        Showing {shown.length} {shown.length === 1 ? 'item' : 'items'}
      </p>

      <ul className="gw__wall">
        {shown.map((it, i) => (
          <li key={`${it.id}`} className="gw__tile" style={{ '--i': Math.min(i, 12) } as CSSProperties}>
            <button
              type="button"
              className="gw__media"
              onClick={() => show(i)}
              aria-label={`${it.kind === 'video' ? 'Play video' : 'Open photo'}: ${it.alt}`}
            >
              {it.kind === 'image' ? (
                <img src={it.src} alt="" loading={i < 4 ? 'eager' : 'lazy'} decoding="async" />
              ) : it.poster ? (
                <img src={it.poster} alt="" loading="lazy" decoding="async" />
              ) : it.embed ? (
                <span className="gw__blank" aria-hidden="true" />
              ) : (
                <video src={`${it.src}#t=0.1`} preload="metadata" muted playsInline tabIndex={-1} aria-hidden="true" />
              )}
              {it.kind === 'video' && (
                <span className="gw__play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                  </svg>
                </span>
              )}
            </button>
            {(it.caption || it.topic) && (
              <p className="gw__cap">
                {it.caption || it.alt}
                {it.topic && !topic && <span>{it.topic}</span>}
              </p>
            )}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="glb"
        aria-label={current ? current.alt : 'Gallery viewer'}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}
        onPointerDown={(e) => {
          const t = e.target as HTMLElement;
          swipe.current = t.tagName === 'VIDEO' || t.tagName === 'IFRAME' || t.tagName === 'BUTTON' ? null : e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipe.current === null) return;
          const dx = e.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        }}
      >
        {current && (
          <div className="glb__body">
            <div className="glb__stage" key={current.id}>
              <Large item={current} />
            </div>
            <div className="glb__info">
              <p className="glb__count">
                {(open ?? 0) + 1} / {shown.length}
              </p>
              {current.caption && <p className="glb__cap">{current.caption}</p>}
              {current.topic && <p className="glb__topic">{current.topic}</p>}
            </div>
          </div>
        )}
        <button type="button" className="glb__close" onClick={close} aria-label="Close viewer">
          Close
        </button>
        {shown.length > 1 && (
          <>
            <button type="button" className="glb__nav glb__nav--prev" onClick={() => step(-1)} aria-label="Previous">
              &lsaquo;
            </button>
            <button type="button" className="glb__nav glb__nav--next" onClick={() => step(1)} aria-label="Next">
              &rsaquo;
            </button>
          </>
        )}
      </dialog>
    </div>
  );
}

function Large({ item }: { item: GItem }) {
  if (item.kind === 'video') {
    const embed = parseEmbed(item.src);
    if (embed) {
      return (
        <div className="glb__frame">
          <iframe
            src={embed.src}
            title={item.alt}
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      );
    }
    return <video src={item.src} poster={item.poster || undefined} controls autoPlay playsInline aria-label={item.alt} />;
  }
  return <img src={item.src} alt={item.alt} />;
}
