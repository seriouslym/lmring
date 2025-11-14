import type { Locale } from '@lmring/i18n';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { UserMenu } from '@/components/user-menu';
import { auth } from '@/libs/Auth';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function PublicLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: 'PublicLayout',
  });

  // Check if user is logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Prepare user data if logged in
  const userData = session?.user
    ? {
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        image: session.user.image || 'https://github.com/shadcn.png',
      }
    : undefined;

  return (
    <BaseTemplate
      showSidebar={false}
      rightNav={
        <>
          {!session?.user ? (
            <>
              <li>
                <Link href="/sign-in/" className="border-none text-gray-700 hover:text-gray-900">
                  {t('sign_in_link')}
                </Link>
              </li>
              <li>
                <Link href="/sign-up/" className="border-none text-gray-700 hover:text-gray-900">
                  {t('sign_up_link')}
                </Link>
              </li>
            </>
          ) : (
            <li>
              <UserMenu user={userData} />
            </li>
          )}
          <li>
            <Link href="/arena/" className="border-none text-gray-700 hover:text-gray-900">
              {t('arena_link')}
            </Link>
          </li>
          <li>
            <LocaleSwitcher />
          </li>
        </>
      }
    >
      {props.children}
    </BaseTemplate>
  );
}
