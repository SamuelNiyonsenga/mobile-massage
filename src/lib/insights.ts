/**
 * Everything about articles that does not need a browser or Next.js:
 * web addresses, scheduling, topics, reading time, and a small, safe text formatter.
 *
 * The formatter returns plain data (blocks and inline pieces). Pages turn that data into
 * React elements, so pasted text can never inject markup or scripts.
 */
import type { ArticleEntry, InsightsContent } from '@/lib/cms/defaults';

export interface Article extends ArticleEntry {
  /** Final, unique web address ending */
  slug: string;
  words: number;
  minutes: number;
}

/* ---------- Basics ---------- */

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

export const todayISO = (now: Date = new Date()) => now.toISOString().slice(0, 10);

export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function rfc822(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? '' : d.toUTCString();
}

export function wordCount(body: string): number {
  return body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`]/g, ' ')
    .replace(/^\s*(?:[-]|\d+[.)])\s+/gm, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

export const minutesFor = (words: number) => Math.max(1, Math.ceil(words / 200));

/* ---------- Choosing what to show ---------- */

/** Articles that have what a page needs (a title and some text), each with its own unique address. */
export function normalizeArticles(content: InsightsContent): Article[] {
  const seen = new Map<string, number>();
  const out: Article[] = [];
  content.articles.items.forEach((item, i) => {
    if (!item.title.trim() || !item.body.trim()) return;
    const base = slugify(item.slug) || slugify(item.title) || `article-${i + 1}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const words = wordCount(item.body);
    out.push({ ...item, slug: n === 1 ? base : `${base}-${n}`, words, minutes: minutesFor(words) });
  });
  return out;
}

/**
 * Public view: published and already due. Preview (signed-in editors) also shows drafts and scheduled articles.
 * Newest first; articles without a date go last.
 */
export function visibleArticles(content: InsightsContent, opts: { preview: boolean; today: string }): Article[] {
  const all = normalizeArticles(content).filter(
    (a) => opts.preview || (a.status === 'published' && (a.date === '' || a.date <= opts.today)),
  );
  return all
    .map((a, i) => ({ a, i }))
    .sort((x, y) => {
      if (x.a.date !== y.a.date) {
        if (!x.a.date) return 1;
        if (!y.a.date) return -1;
        return y.a.date.localeCompare(x.a.date);
      }
      return x.i - y.i;
    })
    .map((x) => x.a);
}

export function isLive(a: Article, today: string): boolean {
  return a.status === 'published' && (a.date === '' || a.date <= today);
}

export interface Topic {
  name: string;
  slug: string;
  count: number;
}

export function topicsOf(list: Article[]): Topic[] {
  const map = new Map<string, Topic>();
  for (const a of list) {
    const name = a.category.trim();
    const slug = slugify(name);
    if (!slug) continue;
    const t = map.get(slug);
    if (t) t.count++;
    else map.set(slug, { name, slug, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const filterByTopic = (list: Article[], topicSlug: string) =>
  topicSlug ? list.filter((a) => slugify(a.category) === topicSlug) : list;

export const featuredOf = (list: Article[]): Article | undefined => list.find((a) => a.featured) ?? list[0];

/** Same topic first, then the newest others. */
export function relatedTo(list: Article[], current: Article, n = 2): Article[] {
  const others = list.filter((a) => a.slug !== current.slug);
  const same = others.filter((a) => slugify(a.category) === slugify(current.category) && !!slugify(current.category));
  const rest = others.filter((a) => !same.includes(a));
  return [...same, ...rest].slice(0, n);
}

export const articlePath = (slug: string) => `/insights/${slug}`;

/* ---------- Safe text formatter ---------- */

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'b' | 'i'; c: Inline[] }
  | { t: 'a'; href: string; external: boolean; c: Inline[] };

export type Block =
  | { t: 'h2' | 'h3'; id: string; text: string }
  | { t: 'p'; c: Inline[] }
  | { t: 'ul' | 'ol'; items: Inline[][] }
  | { t: 'quote'; c: Inline[] }
  | { t: 'img'; src: string; alt: string }
  | { t: 'hr' };

export function safeHref(u: string): string | null {
  const s = u.trim();
  return /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(s) ? s : null;
}

export function safeImageSrc(u: string): string | null {
  const s = u.trim();
  return /^(\/(?!\/)|https:\/\/)/i.test(s) ? s : null;
}

export function inlineText(nodes: Inline[]): string {
  return nodes.map((n) => (n.t === 'text' ? n.v : inlineText(n.c))).join('');
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = '';
  let i = 0;
  const flush = () => {
    if (buf) {
      out.push({ t: 'text', v: buf });
      buf = '';
    }
  };

  while (i < src.length) {
    const ch = src[i];

    if (ch === '\\' && i + 1 < src.length && /[\\*_[\]()`#>-]/.test(src[i + 1])) {
      buf += src[i + 1];
      i += 2;
      continue;
    }

    if (ch === '[') {
      const mid = src.indexOf('](', i);
      const end = mid > i ? src.indexOf(')', mid + 2) : -1;
      if (mid > i && end > mid) {
        const label = src.slice(i + 1, mid);
        if (label && !label.includes('[') && !label.includes(']')) {
          flush();
          const href = safeHref(src.slice(mid + 2, end));
          const kids = parseInline(label);
          if (href) out.push({ t: 'a', href, external: /^https?:/i.test(href), c: kids });
          else out.push(...kids); // unsafe address: keep the words, drop the link
          i = end + 1;
          continue;
        }
      }
    }

    if (src.startsWith('**', i)) {
      const end = src.indexOf('**', i + 2);
      if (end > i + 2) {
        flush();
        out.push({ t: 'b', c: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    if (ch === '*' || ch === '_') {
      const end = src.indexOf(ch, i + 1);
      const intraword = ch === '_' && i > 0 && /\w/.test(src[i - 1]);
      if (!intraword && end > i + 1 && src[i + 1] !== ' ' && src[end - 1] !== ' ') {
        flush();
        out.push({ t: 'i', c: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    buf += ch;
    i++;
  }
  flush();
  return out;
}

const isBlockStart = (l: string) =>
  /^(#{1,3})\s+\S/.test(l) || /^>\s?/.test(l) || /^[-*]\s+\S/.test(l) || /^\d+[.)]\s+\S/.test(l) || /^---+$/.test(l) || /^!\[[^\]]*\]\([^)\s]+\)$/.test(l);

export function parseBody(body: string): Block[] {
  const lines = body.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim());
  const blocks: Block[] = [];
  const ids = new Map<string, number>();
  const idFor = (text: string) => {
    const base = slugify(text) || 'section';
    const n = (ids.get(base) ?? 0) + 1;
    ids.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i++;
      continue;
    }

    if (/^---+$/.test(line)) {
      blocks.push({ t: 'hr' });
      i++;
      continue;
    }

    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      const text = inlineText(parseInline(h[2]));
      blocks.push({ t: h[1].length === 3 ? 'h3' : 'h2', id: idFor(text), text });
      i++;
      continue;
    }

    const img = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(line);
    if (img) {
      const src = safeImageSrc(img[2]);
      if (src) blocks.push({ t: 'img', src, alt: img[1].trim() });
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const parts: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) parts.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ t: 'quote', c: parseInline(parts.join(' ').trim()) });
      continue;
    }

    if (/^[-*]\s+\S/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^[-*]\s+\S/.test(lines[i])) items.push(parseInline(lines[i++].replace(/^[-*]\s+/, '')));
      blocks.push({ t: 'ul', items });
      continue;
    }

    if (/^\d+[.)]\s+\S/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\d+[.)]\s+\S/.test(lines[i])) items.push(parseInline(lines[i++].replace(/^\d+[.)]\s+/, '')));
      blocks.push({ t: 'ol', items });
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i] && !(para.length > 0 && isBlockStart(lines[i]))) para.push(lines[i++]);
    blocks.push({ t: 'p', c: parseInline(para.join(' ')) });
  }
  return blocks;
}

export const tocOf = (blocks: Block[]) =>
  blocks.flatMap((b) => (b.t === 'h2' ? [{ id: b.id, text: b.text }] : []));
