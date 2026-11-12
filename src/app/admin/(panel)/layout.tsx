import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/cms/auth';
import LogoutButton from './LogoutButton';
import '../admin.css';

export const metadata = { title: 'CMS', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthed())) redirect('/admin/login');
  return (
    <div className="adm">
      <header className="adm-bar">
        <Link href="/admin" className="adm-bar__brand">
          Mobile Massage CMS
        </Link>
        <nav className="adm-bar__nav" aria-label="CMS">
          <Link href="/admin/media">Media</Link>
          <Link href="/" target="_blank" rel="noopener">
            View site
          </Link>
          <LogoutButton />
        </nav>
      </header>
      {children}
    </div>
  );
}
