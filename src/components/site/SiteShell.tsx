import Link from 'next/link';
import type { SiteContent } from '@/lib/cms/defaults';
import Header from './Header';
import Footer from './Footer';
import './site.css';

export default function SiteShell({
  site,
  preview = false,
  editorHref = '/admin',
  children,
}: {
  site: SiteContent;
  preview?: boolean;
  /** Where "Back to the editor" leads, e.g. /admin/about */
  editorHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="site">
      <a href="#content" className="skip">
        Skip to content
      </a>
      {preview && (
        <div className="previewbar" role="status">
          You are previewing the draft. Visitors still see the published page.{' '}
          <Link href={editorHref}>Back to the editor</Link>
        </div>
      )}
      <Header site={site} />
      <main id="content">{children}</main>
      <Footer site={site} />
    </div>
  );
}
