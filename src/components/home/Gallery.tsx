'use client';

import { useRef, useState } from 'react';
import type { HomeContent } from '@/lib/cms/defaults';
import { isFileVideo, parseEmbed } from '@/lib/embed';

type Item = HomeContent['gallery']['items'][number];

export default function Gallery({ gallery }: { gallery: HomeContent['gallery'] }) {
  const items = gallery.items.filter((i) => i.src);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  if (!gallery.visible || items.length === 0) return null;

  const show = (i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const step = (d: number) => setOpen((o) => (o === null ? o : (o + d + items.length) % items.length));
  const current = open === null ? null : items[open];

  return (
    <section className="sec sec--alt" id="gallery" aria-labelledby="gallery-title">
      <div className="wrap">
        <div className="sec__head">
          <h2 id="gallery-title" className="h2">
            {gallery.title}
          </h2>
          {gallery.intro && <p className="intro-line">{gallery.intro}</p>}
        </div>

        <ul className="gal">
          {items.map((it, i) => (
            <li key={`${it.src}-${i}`} className={`gal__item${i === 0 ? ' gal__item--lead' : ''}`}>
              <Tile item={it} onOpen={() => show(i)} />
              {it.caption && <p className="gal__cap">{it.caption}</p>}
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={current?.caption || current?.alt || 'Gallery'}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}
      >
        {current && (
          <div className="lightbox__body">
            <Large item={current} />
            {current.caption && <p className="lightbox__cap">{current.caption}</p>}
          </div>
        )}
        <button type="button" className="lightbox__close" onClick={close} aria-label="Close">
          Close
        </button>
        {items.length > 1 && (
          <>
            <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => step(-1)} aria-label="Previous">
              &lsaquo;
            </button>
            <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => step(1)} aria-label="Next">
              &rsaquo;
            </button>
          </>
        )}
      </dialog>
    </section>
  );
}

function Tile({ item, onOpen }: { item: Item; onOpen: () => void }) {
  const embed = item.kind === 'video' ? parseEmbed(item.src) : null;

  if (item.kind === 'video') {
    // Uploaded videos play right in the tile. Linked videos open in the viewer.
    if (!embed && isFileVideo(item.src)) {
      return (
        <div className="gal__media">
          <video
            src={item.src}
            poster={item.poster || undefined}
            controls
            playsInline
            preload="metadata"
            aria-label={item.alt || item.caption || 'Video'}
          />
        </div>
      );
    }
    return (
      <button type="button" className="gal__media gal__play" onClick={onOpen} aria-label={`Play video: ${item.alt || item.caption || 'video'}`}>
        {item.poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.poster} alt="" loading="lazy" />
        )}
        <span className="gal__badge" aria-hidden="true">
          &#9654;
        </span>
      </button>
    );
  }

  return (
    <button type="button" className="gal__media" onClick={onOpen} aria-label={`Open photo: ${item.alt || item.caption || 'photo'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
    </button>
  );
}

function Large({ item }: { item: Item }) {
  if (item.kind === 'video') {
    const embed = parseEmbed(item.src);
    if (embed) {
      return (
        <div className="lightbox__frame">
          <iframe
            src={embed.src}
            title={item.alt || item.caption || 'Video'}
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      );
    }
    return <video src={item.src} poster={item.poster || undefined} controls autoPlay playsInline />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.src} alt={item.alt} />;
}
