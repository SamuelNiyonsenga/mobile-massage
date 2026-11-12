import { MAX_PHOTO_MB, MAX_VIDEO_MB, listMedia } from '@/lib/cms/media';
import MediaManager from './MediaManager';

export const metadata = { title: 'Media library' };

export default async function MediaPage() {
  const items = await listMedia();
  return (
    <main className="adm-main adm-main--wide">
      <h1>Media library</h1>
      <p className="adm-lead">
        Upload photos and videos here, or straight from any photo or video field in the editor. Photos can be up to
        {MAX_PHOTO_MB} MB (JPG, PNG, WebP, AVIF). Videos can be up to {MAX_VIDEO_MB} MB (MP4, WebM). For longer videos, paste a YouTube or
        Vimeo link into a Home page photos and videos item instead.
      </p>
      <MediaManager initialItems={items} />
    </main>
  );
}
