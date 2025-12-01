import type { Locale } from '@lmring/i18n';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Sidebar } from '@/components/sidebar';
import { auth } from '@/libs/Auth';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);

  // Get session from server-side auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to sign-in if no session
  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  const user = session.user;

  // Map Better-Auth fields to expected UI fields
  const userData = {
    name: user.name || user.email,
    email: user.email,
    image: user.image || 'https://github.com/shadcn.png',
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Full Height */}
      <Sidebar locale={locale} user={userData} />

      {/* Right Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-auto">{props.children}</main>
      </div>
    </div>
  );
}
