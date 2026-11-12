/**
 * Gallery logic that needs no browser: which items are usable, their descriptions,
 * and the topics for the filter buttons.
 */
import type { GalleryItem } from '@/lib/cms/defaults';
import { isFileVideo, parseEmbed } from '@/lib/embed';
import { safeImageSrc, slugify } from '@/lib/insights';

export interface GItem extends GalleryItem {
  /** Position among the usable items; stable key and lightbox index */
  id: number;
  /** Always non-empty, so every photo has a description */
  alt: string;
  embed: boolean;
  topic: string;
}

export interface GTopic {
  name: string;
  slug: string;
  count: number;
}

/** Items that can actually be shown: a safe photo address, or an uploaded video, or a YouTube/Vimeo link. */
export function usableItems(items: GalleryItem[]): GItem[] {
  const out: GItem[] = [];
  for (const it of items) {
    const src = it.src.trim();
    if (!src) continue;
    const isVideo = it.kind === 'video';
    const embed = isVideo && !!parseEmbed(src);
    if (isVideo ? !(embed || (isFileVideo(src) && safeImageSrc(src))) : !safeImageSrc(src)) continue;
    const topic = it.category.trim();
    out.push({
      ...it,
      src,
      id: out.length,
      embed,
      topic,
      alt: it.alt.trim() || it.caption.trim() || (topic ? `${topic}: Mobile Massage ${isVideo ? 'video' : 'photo'}` : `Mobile Massage ${isVideo ? 'video' : 'photo'}`),
    });
  }
  return out;
}

export function topicsOfItems(items: GItem[]): GTopic[] {
  const map = new Map<string, GTopic>();
  for (const it of items) {
    const slug = slugify(it.topic);
    if (!slug) continue;
    const t = map.get(slug);
    if (t) t.count++;
    else map.set(slug, { name: it.topic, slug, count: 1 });
  }
  return [...map.values()];
}

export const itemsInTopic = (items: GItem[], slug: string) => (slug ? items.filter((i) => slugify(i.topic) === slug) : items);

/** Photo used when the page is shared: the chosen share image, else the first photo. */
export const galleryShareImage = (shareImage: string, items: GItem[]) =>
  shareImage || items.find((i) => i.kind === 'image')?.src || '';
