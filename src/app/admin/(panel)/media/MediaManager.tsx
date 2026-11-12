'use client';

import { useState } from 'react';

interface Item {
  name: string;
  url: string;
  kind: 'image' | 'video';
  size: number;
  uploadedAt: string;
  usedIn: string[];
}

const PAGE_NAMES: Record<string, string> = { home: 'Home page', about: 'About us page', collection: 'Collection page', contact: 'Contact page', site: 'Site settings' };

const fmtSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function MediaManager({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  async function upload(files: FileList) {
    setBusy(true);
    setMessage(null);
    let added = 0;
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/cms/upload', { method: 'POST', body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: 'error', text: `${file.name}: ${json.error ?? 'Upload failed.'}` });
        break;
      }
      added++;
    }
    if (added > 0) {
      const res = await fetch('/api/cms/media');
      const json = await res.json().catch(() => ({}));
      if (res.ok) setItems(json.items);
      setMessage((m) => m ?? { kind: 'ok', text: `${added} file${added === 1 ? '' : 's'} uploaded.` });
    }
    setBusy(false);
  }

  async function remove(item: Item) {
    if (!window.confirm(`Delete this ${item.kind}? This cannot be undone.`)) return;
    const res = await fetch(`/api/cms/media/${item.name}`, { method: 'DELETE' });
    if (res.ok) {
      setItems((list) => list.filter((i) => i.name !== item.name));
      setMessage({ kind: 'ok', text: 'File deleted.' });
    } else {
      const json = await res.json().catch(() => ({}));
      setMessage({ kind: 'error', text: json.error ?? 'Could not delete the file.' });
    }
  }

  async function copy(item: Item) {
    try {
      await navigator.clipboard.writeText(item.url);
      setMessage({ kind: 'ok', text: `Copied ${item.url}` });
    } catch {
      setMessage({ kind: 'error', text: `Copy this address: ${item.url}` });
    }
  }

  return (
    <div>
      <div className="ed__actions" style={{ marginBottom: 20 }}>
        <label className="adm-btn adm-btn--primary adm-btn--file">
          {busy ? 'Uploading' : 'Upload photos or videos'}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              if (e.target.files?.length) void upload(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {message && (
        <p role={message.kind === 'error' ? 'alert' : 'status'} className={`ed__status ed__status--${message.kind}`}>
          {message.text}
        </p>
      )}

      {items.length === 0 ? (
        <p className="adm-note">Nothing here yet. Upload your first photo or video.</p>
      ) : (
        <ul className="mm-grid">
          {items.map((i) => (
            <li key={i.name} className="mm-card">
              <div className="mm-card__thumb">
                {i.kind === 'video' ? (
                  <video src={i.url} controls muted preload="metadata" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.url} alt="" loading="lazy" />
                )}
              </div>
              <div className="mm-card__meta">
                <span>
                  {i.kind === 'video' ? 'Video' : 'Photo'}, {fmtSize(i.size)}
                </span>
                <span className="mm-card__used">
                  {i.usedIn.length
                    ? `Used on: ${i.usedIn.map((k) => PAGE_NAMES[k] ?? k).join(', ')}`
                    : 'Not used on any page'}
                </span>
                <span className="mm-card__tools">
                  <button type="button" className="adm-link-btn" onClick={() => copy(i)}>
                    Copy address
                  </button>
                  <button
                    type="button"
                    className="adm-link-btn"
                    onClick={() => remove(i)}
                    disabled={i.usedIn.length > 0}
                    title={i.usedIn.length ? 'Remove it from the page first' : undefined}
                  >
                    Delete
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
