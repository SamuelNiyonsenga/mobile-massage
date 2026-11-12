/**
 * Schema-driven content model.
 * A document (e.g. the home page) is described by a list of Fields. The admin editor
 * renders its forms from this description, and the server uses it to validate and
 * clean everything that is saved, so malformed content can never reach the site.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'date'
  | 'image'
  | 'video'
  | 'media'
  | 'number'
  | 'boolean'
  | 'select'
  | 'group'
  | 'list'
  | 'stringList';

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  rows?: number;
  options?: { label: string; value: string }[];
  /** Child fields for `group` and `list` */
  fields?: Field[];
  /** For `list`: which child field names the item in the editor */
  titleField?: string;
  /** For `list`: singular noun used on the "Add" button */
  itemNoun?: string;
  max?: number;
  /** For long text (e.g. an article body): the most characters kept. Defaults to 5000. */
  maxLength?: number;
  /** Only show this field when a sibling field has this value */
  showWhen?: { field: string; equals: string };
  /** Character guide shown under text fields (used for SEO titles and descriptions) */
  counter?: { min: number; max: number };
}

export interface DocDef {
  key: string;
  title: string;
  description: string;
  /** Public URL where this document is visible */
  viewPath: string;
  /** Top-level fields; each must be a `group` (they become the editor's sections) */
  fields: Field[];
}

const SAFE_URL = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;
const SAFE_IMAGE = /^(\/(?!\/)|https:\/\/)/i;

export function sanitizeValue(f: Field, v: unknown): unknown {
  switch (f.type) {
    case 'text':
      return typeof v === 'string' ? v.slice(0, 500) : '';
    case 'textarea':
      return typeof v === 'string' ? v.slice(0, f.maxLength ?? 5000) : '';
    case 'date':
      return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.trim()) ? v.trim() : '';
    case 'url': {
      const s = typeof v === 'string' ? v.trim().slice(0, 1000) : '';
      return s === '' || SAFE_URL.test(s) ? s : '';
    }
    case 'image':
    case 'media': {
      const s = typeof v === 'string' ? v.trim().slice(0, 1000) : '';
      return s === '' || SAFE_IMAGE.test(s) ? s : '';
    }
    case 'number': {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
    case 'boolean':
      return v === true;
    case 'select': {
      const ok = f.options?.some((o) => o.value === v);
      return ok ? v : f.options?.[0]?.value ?? '';
    }
    case 'group':
      return sanitizeObject(f.fields ?? [], v);
    case 'list': {
      const arr = Array.isArray(v) ? v.slice(0, f.max ?? 60) : [];
      return arr.map((item) => sanitizeObject(f.fields ?? [], item));
    }
    case 'stringList': {
      const arr = Array.isArray(v) ? v.slice(0, f.max ?? 40) : [];
      return arr.map((s) => (typeof s === 'string' ? s.slice(0, 500) : ''));
    }
  }
}

export function sanitizeObject(fields: Field[], v: unknown): Record<string, unknown> {
  const src =
    v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.name] = sanitizeValue(f, src[f.name]);
  return out;
}

export function blankValue(f: Field): unknown {
  switch (f.type) {
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'select':
      return f.options?.[0]?.value ?? '';
    case 'group':
      return blankObject(f.fields ?? []);
    case 'list':
    case 'stringList':
      return [];
    default:
      return '';
  }
}

export function blankObject(fields: Field[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.name] = blankValue(f);
  return out;
}
