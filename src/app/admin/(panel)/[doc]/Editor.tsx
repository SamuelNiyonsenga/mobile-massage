'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { blankObject, blankValue, type Field } from '@/lib/cms/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Path = (string | number)[];
type Update = (path: Path, value: any) => void;

function setIn(o: any, p: Path, v: any): any {
  if (!p.length) return v;
  const [h, ...r] = p;
  if (Array.isArray(o)) {
    const c = [...o];
    c[h as number] = setIn(o[h as number], r, v);
    return c;
  }
  return { ...(o ?? {}), [h]: setIn(o?.[h], r, v) };
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const c = [...arr];
  const [x] = c.splice(from, 1);
  c.splice(to, 0, x);
  return c;
}

interface Props {
  docKey: string;
  title: string;
  /** Public address of this document, e.g. /about */
  viewPath: string;
  fields: Field[];
  initialData: Record<string, any>;
  initialUnpublished: boolean;
  initialHistory: { id: string; at: string }[];
}

export default function Editor({
  docKey,
  title,
  viewPath,
  fields,
  initialData,
  initialUnpublished,
  initialHistory,
}: Props) {
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [saved, setSaved] = useState(JSON.stringify(initialData));
  const [unpublished, setUnpublished] = useState(initialUnpublished);
  const [history, setHistory] = useState(initialHistory);
  const [active, setActive] = useState(fields[0]?.name ?? '');
  const [status, setStatus] = useState<{ kind: 'ok' | 'error' | 'info'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [restoreId, setRestoreId] = useState('');

  const dirty = JSON.stringify(data) !== saved;
  const url = `/api/cms/content/${docKey}`;

  const update: Update = useCallback((path, value) => {
    setData((d) => setIn(d, path, value));
    setStatus(null);
  }, []);

  const request = useCallback(
    async (method: 'PUT' | 'POST', body: unknown) => {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('Your session ended. Sign in again, then save.');
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong. Try again.');
      return json;
    },
    [url],
  );

  const save = useCallback(async () => {
    setBusy(true);
    try {
      const json = await request('PUT', { data });
      setData(json.data);
      setSaved(JSON.stringify(json.data));
      setUnpublished(json.unpublished);
      setStatus({ kind: 'ok', text: 'Draft saved. Visitors still see the published version.' });
      return true;
    } catch (e) {
      setStatus({ kind: 'error', text: (e as Error).message });
      return false;
    } finally {
      setBusy(false);
    }
  }, [data, request]);

  const publish = useCallback(async () => {
    if (!(await save())) return;
    setBusy(true);
    try {
      const json = await request('POST', { action: 'publish' });
      setUnpublished(false);
      setHistory(json.history);
      setStatus({ kind: 'ok', text: 'Published. The live site is updated.' });
    } catch (e) {
      setStatus({ kind: 'error', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }, [save, request]);

  async function discard() {
    if (!window.confirm('Discard all draft changes and go back to the published version?')) return;
    setBusy(true);
    try {
      const json = await request('POST', { action: 'discard' });
      setData(json.data);
      setSaved(JSON.stringify(json.data));
      setUnpublished(false);
      setStatus({ kind: 'info', text: 'Draft discarded.' });
    } catch (e) {
      setStatus({ kind: 'error', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    if (!restoreId) return;
    if (dirty && !window.confirm('Loading an older version replaces your unsaved edits. Continue?')) return;
    setBusy(true);
    try {
      const json = await request('POST', { action: 'restore', id: restoreId });
      setData(json.data);
      setSaved(JSON.stringify(json.data));
      setUnpublished(json.unpublished);
      setStatus({ kind: 'info', text: 'Older version loaded as a draft. Review it, then publish.' });
    } catch (e) {
      setStatus({ kind: 'error', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  // Ctrl/Cmd+S saves the draft
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const onBefore = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, [dirty]);

  const section = fields.find((f) => f.name === active) ?? fields[0];

  return (
    <div className="ed">
      <div className="ed__head">
        <div>
          <h1>{title}</h1>
          <p className="ed__state" aria-live="polite">
            {dirty
              ? 'You have unsaved edits.'
              : unpublished
                ? 'Draft saved, not published yet.'
                : 'No pending changes.'}
          </p>
        </div>
        <div className="ed__actions">
          <a className="adm-btn" href={`${viewPath}?preview=1`} target="_blank" rel="noopener">
            Preview draft
          </a>
          <button className="adm-btn" onClick={save} disabled={busy || !dirty}>
            Save draft
          </button>
          <button
            className="adm-btn adm-btn--primary"
            onClick={publish}
            disabled={busy || (!dirty && !unpublished)}
          >
            Publish
          </button>
        </div>
      </div>

      {status && (
        <p role={status.kind === 'error' ? 'alert' : 'status'} className={`ed__status ed__status--${status.kind}`}>
          {status.text}
        </p>
      )}

      <div className="ed__body">
        <nav className="ed__rail" aria-label="Sections">
          {fields.map((f) => (
            <button
              key={f.name}
              type="button"
              className={f.name === section.name ? 'is-active' : ''}
              aria-current={f.name === section.name ? 'true' : undefined}
              onClick={() => setActive(f.name)}
            >
              {f.label}
            </button>
          ))}

          <div className="ed__tools">
            {unpublished && (
              <button type="button" className="adm-link-btn" onClick={discard} disabled={busy}>
                Discard draft changes
              </button>
            )}
            {history.length > 0 && (
              <div className="ed__history">
                <label htmlFor="restore">Earlier published versions</label>
                <select id="restore" value={restoreId} onChange={(e) => setRestoreId(e.target.value)}>
                  <option value="">Choose a version</option>
                  {history.map((h) => (
                    <option key={h.id} value={h.id}>
                      {new Date(h.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </option>
                  ))}
                </select>
                <button type="button" className="adm-btn" onClick={restore} disabled={!restoreId || busy}>
                  Load as draft
                </button>
              </div>
            )}
          </div>
        </nav>

        <section className="ed__panel" aria-labelledby="panel-title">
          <h2 id="panel-title">{section.label}</h2>
          <FieldList fields={section.fields ?? []} value={data[section.name]} path={[section.name]} update={update} />
        </section>
      </div>
    </div>
  );
}

function FieldList({
  fields,
  value,
  path,
  update,
}: {
  fields: Field[];
  value: any;
  path: Path;
  update: Update;
}) {
  return (
    <>
      {fields.map((f) => (
        <FieldView key={f.name} field={f} value={value?.[f.name]} path={[...path, f.name]} update={update} />
      ))}
    </>
  );
}

function FieldView({ field, value, path, update }: { field: Field; value: any; path: Path; update: Update }) {
  const id = `f-${path.join('-')}`;
  const help = field.help ? (
    <p className="fld__help" id={`${id}-help`}>
      {field.help}
    </p>
  ) : null;
  const describedBy = field.help ? `${id}-help` : undefined;
  const count = field.counter ? <Counter value={value ?? ''} min={field.counter.min} max={field.counter.max} /> : null;

  switch (field.type) {
    case 'text':
    case 'url':
      return (
        <div className="fld">
          <label htmlFor={id}>{field.label}</label>
          <input
            id={id}
            type="text"
            inputMode={field.type === 'url' ? 'url' : undefined}
            value={value ?? ''}
            placeholder={field.placeholder}
            aria-describedby={describedBy}
            onChange={(e) => update(path, e.target.value)}
          />
          {count}
          {help}
        </div>
      );

    case 'date':
      return (
        <div className="fld">
          <label htmlFor={id}>{field.label}</label>
          <input
            id={id}
            type="date"
            value={value ?? ''}
            aria-describedby={describedBy}
            onChange={(e) => update(path, e.target.value)}
          />
          {help}
        </div>
      );

    case 'textarea':
      return (
        <div className="fld">
          <label htmlFor={id}>{field.label}</label>
          <textarea
            id={id}
            rows={field.rows ?? 4}
            maxLength={field.maxLength}
            value={value ?? ''}
            aria-describedby={describedBy}
            onChange={(e) => update(path, e.target.value)}
          />
          {count}
          {help}
        </div>
      );

    case 'number':
      return (
        <div className="fld">
          <label htmlFor={id}>{field.label}</label>
          <input
            id={id}
            type="number"
            value={value ?? 0}
            aria-describedby={describedBy}
            onChange={(e) => update(path, e.target.value === '' ? 0 : Number(e.target.value))}
          />
          {help}
        </div>
      );

    case 'boolean':
      return (
        <div className="fld fld--check">
          <label htmlFor={id}>
            <input id={id} type="checkbox" checked={value === true} onChange={(e) => update(path, e.target.checked)} />
            <span>{field.label}</span>
          </label>
          {help}
        </div>
      );

    case 'select':
      return (
        <div className="fld">
          <label htmlFor={id}>{field.label}</label>
          <select id={id} value={value ?? ''} onChange={(e) => update(path, e.target.value)}>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {help}
        </div>
      );

    case 'image':
    case 'media':
      return <MediaField id={id} field={field} value={value ?? ''} path={path} update={update} help={help} />;

    case 'group':
      return (
        <fieldset className="fld-group">
          <legend>{field.label}</legend>
          {help}
          <FieldList fields={field.fields ?? []} value={value} path={path} update={update} />
        </fieldset>
      );

    case 'stringList': {
      const items: string[] = Array.isArray(value) ? value : [];
      return (
        <fieldset className="fld-group">
          <legend>{field.label}</legend>
          {help}
          {items.map((s, i) => (
            <div className="row" key={i}>
              <input
                type="text"
                aria-label={`${field.label} ${i + 1}`}
                value={s}
                onChange={(e) => update(path, items.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <button type="button" className="adm-icon" aria-label={`Move ${field.label} ${i + 1} up`} disabled={i === 0} onClick={() => update(path, move(items, i, i - 1))}>
                ↑
              </button>
              <button type="button" className="adm-icon" aria-label={`Move ${field.label} ${i + 1} down`} disabled={i === items.length - 1} onClick={() => update(path, move(items, i, i + 1))}>
                ↓
              </button>
              <button type="button" className="adm-icon" aria-label={`Remove ${field.label} ${i + 1}`} onClick={() => update(path, items.filter((_, j) => j !== i))}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="adm-btn" onClick={() => update(path, [...items, ''])}>
            Add item
          </button>
        </fieldset>
      );
    }

    case 'list': {
      const items: any[] = Array.isArray(value) ? value : [];
      const noun = field.itemNoun ?? 'item';
      const atMax = items.length >= (field.max ?? 60);
      return (
        <fieldset className="fld-group">
          <legend>{field.label}</legend>
          {help}
          {items.length === 0 && <p className="fld__help">Nothing here yet. Add the first {noun}.</p>}
          {items.map((item, i) => {
            const label = (field.titleField && String(item?.[field.titleField] ?? '').trim()) || `${noun} ${i + 1}`;
            return (
              <details className="item" key={i} open={items.length <= 3}>
                <summary>
                  <span className="item__title">{label}</span>
                  <span className="item__tools" onClick={(e) => e.preventDefault()}>
                    <button type="button" className="adm-icon" aria-label={`Move ${label} up`} disabled={i === 0} onClick={() => update(path, move(items, i, i - 1))}>
                      ↑
                    </button>
                    <button type="button" className="adm-icon" aria-label={`Move ${label} down`} disabled={i === items.length - 1} onClick={() => update(path, move(items, i, i + 1))}>
                      ↓
                    </button>
                    <button
                      type="button"
                      className="adm-icon"
                      aria-label={`Remove ${label}`}
                      onClick={() => {
                        if (window.confirm(`Remove "${label}"?`)) update(path, items.filter((_, j) => j !== i));
                      }}
                    >
                      ✕
                    </button>
                  </span>
                </summary>
                <div className="item__body">
                  <FieldList fields={field.fields ?? []} value={item} path={[...path, i]} update={update} />
                </div>
              </details>
            );
          })}
          <button
            type="button"
            className="adm-btn"
            disabled={atMax}
            onClick={() => update(path, [...items, blankObject(field.fields ?? [])])}
          >
            Add {noun}
          </button>
        </fieldset>
      );
    }
  }
}

/** Live length guide for search titles and descriptions. */
function Counter({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value.trim().length;
  const state = n === 0 ? 'empty' : n < min ? 'short' : n > max ? 'long' : 'good';
  const note = {
    empty: `Aim for ${min} to ${max} characters.`,
    short: `${n} characters. A little more detail would help (aim for ${min} to ${max}).`,
    good: `${n} characters. Good length.`,
    long: `${n} characters. Google may cut it off after about ${max}.`,
  }[state];
  return (
    <p className={`fld__count fld__count--${state}`}>
      {note}
    </p>
  );
}

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';
const MEDIA_ACCEPT = `${IMAGE_ACCEPT},video/mp4,video/webm`;
const isVideoUrl = (u: string) => /\.(mp4|webm)(\?|$)/i.test(u);
const isEmbedUrl = (u: string) => /(youtube\.com|youtu\.be|vimeo\.com)/i.test(u);

interface LibraryItem {
  name: string;
  url: string;
  kind: 'image' | 'video';
  size: number;
}

function MediaField({
  id,
  field,
  value,
  path,
  update,
  help,
}: {
  id: string;
  field: Field;
  value: string;
  path: Path;
  update: Update;
  help: React.ReactNode;
}) {
  const allowVideo = field.type === 'media';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/cms/upload', { method: 'POST', body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Upload failed. Try again.');
      update(path, json.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function openLibrary() {
    setError('');
    dialog.current?.showModal();
    try {
      const res = await fetch('/api/cms/media');
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Could not load the library.');
      setItems(json.items);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const visibleItems = (items ?? []).filter((i) => allowVideo || i.kind === 'image');

  return (
    <div className="fld">
      <label htmlFor={id}>{field.label}</label>
      <div className="row row--wrap">
        <input
          id={id}
          type="text"
          value={value}
          placeholder={allowVideo ? '/media/… or a YouTube link' : '/media/… or https://…'}
          onChange={(e) => update(path, e.target.value)}
        />
        <label className="adm-btn adm-btn--file">
          {busy ? 'Uploading' : 'Upload'}
          <input
            type="file"
            accept={allowVideo ? MEDIA_ACCEPT : IMAGE_ACCEPT}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = '';
            }}
          />
        </label>
        <button type="button" className="adm-btn" onClick={openLibrary}>
          Library
        </button>
        {value && (
          <button type="button" className="adm-btn" onClick={() => update(path, '')}>
            Remove
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="adm-error">
          {error}
        </p>
      )}
      {value && isVideoUrl(value) && <video className="fld__preview" src={value} controls muted preload="metadata" />}
      {value && !isVideoUrl(value) && isEmbedUrl(value) && <p className="fld__help">Video link added. It plays on the site.</p>}
      {value && !isVideoUrl(value) && !isEmbedUrl(value) && /* eslint-disable-next-line @next/next/no-img-element */ <img className="fld__preview" src={value} alt="" />}
      {help}

      <dialog ref={dialog} className="lib" aria-label="Media library">
        <div className="lib__head">
          <h3>Media library</h3>
          <button type="button" className="adm-btn" onClick={() => dialog.current?.close()}>
            Close
          </button>
        </div>
        {items === null && !error && <p className="fld__help">Loading</p>}
        {items !== null && visibleItems.length === 0 && (
          <p className="fld__help">Nothing uploaded yet. Use Upload to add your first file.</p>
        )}
        <ul className="lib__grid">
          {visibleItems.map((i) => (
            <li key={i.name}>
              <button
                type="button"
                onClick={() => {
                  update(path, i.url);
                  dialog.current?.close();
                }}
                aria-label={`Use ${i.kind} ${i.name}`}
              >
                {i.kind === 'video' ? (
                  <video src={i.url} muted preload="metadata" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.url} alt="" loading="lazy" />
                )}
                <span>{i.kind === 'video' ? 'Video' : 'Photo'}</span>
              </button>
            </li>
          ))}
        </ul>
      </dialog>
    </div>
  );
}

// Re-exported for tests and future page types
export { blankValue };
