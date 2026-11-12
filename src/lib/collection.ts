/** Collection helpers with no browser needs: grouping, lengths and prices, booking messages. */
import type { CollectionContent, TreatmentEntry } from '@/lib/cms/defaults';

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
}

export interface Option {
  label: string;
  price: string;
}

/** "60 minutes | RWF 30,000" becomes { label: "60 minutes", price: "RWF 30,000" }. */
export function parseOption(line: string): Option | null {
  const [label, ...rest] = line.split('|');
  const l = (label ?? '').trim();
  if (!l) return null;
  return { label: l, price: rest.join('|').trim() };
}

export interface Treatment extends TreatmentEntry {
  /** Unique, URL-safe id used for anchors */
  slug: string;
  opts: Option[];
  points: string[];
}

export function treatmentsOf(content: CollectionContent): Treatment[] {
  const seen = new Map<string, number>();
  const out: Treatment[] = [];
  content.menu.items.forEach((t, i) => {
    const name = t.name.trim();
    if (!name) return;
    const base = slugify(name) || `treatment-${i + 1}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    out.push({
      ...t,
      name,
      slug: n === 1 ? base : `${base}-${n}`,
      opts: t.options.map(parseOption).filter((o): o is Option => !!o),
      points: t.goodFor.map((g) => g.trim()).filter(Boolean),
    });
  });
  return out;
}

export interface Group {
  name: string;
  slug: string;
  items: Treatment[];
}

/** Groups keep the order in which they first appear. Treatments without a group share one unnamed group. */
export function groupTreatments(list: Treatment[]): Group[] {
  const groups: Group[] = [];
  const bySlug = new Map<string, Group>();
  for (const t of list) {
    const name = t.category.trim();
    const slug = slugify(name) || 'all';
    let g = bySlug.get(slug);
    if (!g) {
      g = { name, slug, items: [] };
      bySlug.set(slug, g);
      groups.push(g);
    }
    g.items.push(t);
  }
  return groups;
}

export function bookingMessage(treatment: string, option?: string): string {
  return `Hello, I'd like to book the ${treatment}${option ? ` (${option})` : ''}.`;
}
