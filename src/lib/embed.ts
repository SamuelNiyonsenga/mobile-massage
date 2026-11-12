/**
 * Turns a pasted YouTube or Vimeo link into a safe embed address.
 * Only ids that match the providers' own formats are accepted, so a pasted link
 * can never inject anything into the iframe address.
 */
export interface Embed {
  provider: 'youtube' | 'vimeo';
  id: string;
  src: string;
}

export function parseEmbed(raw: string): Embed | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');

  let yt: string | null = null;
  if (host === 'youtu.be') yt = u.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') yt = u.searchParams.get('v');
    else {
      const m = /^\/(embed|shorts|live)\/([^/?#]+)/.exec(u.pathname);
      if (m) yt = m[2];
    }
  }
  if (yt && /^[\w-]{11}$/.test(yt)) {
    return { provider: 'youtube', id: yt, src: `https://www.youtube-nocookie.com/embed/${yt}?rel=0` };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = /\/(?:video\/)?(\d{6,12})(?:\/|$)/.exec(u.pathname);
    if (m) return { provider: 'vimeo', id: m[1], src: `https://player.vimeo.com/video/${m[1]}?dnt=1` };
  }
  return null;
}

export const isFileVideo = (u: string) => /\.(mp4|webm)(\?|$)/i.test(u);
