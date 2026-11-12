import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/cms/auth';
import LoginForm from './LoginForm';
import '../admin.css';

export const metadata = { title: 'Sign in', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await isAuthed()) redirect('/admin');
  return (
    <main className="adm-login">
      <div className="adm-login__card">
        <h1>Mobile Massage CMS</h1>
        <p>Sign in to edit the website.</p>
        <LoginForm />
      </div>
    </main>
  );
}
