import { headers } from 'next/headers';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { UserMenu } from '@/components/user-menu';
import { auth } from '@/libs/Auth';
import { getRequestLocale } from '@/libs/request-locale';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function PublicLayout(props: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
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
        !session?.user ? (
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
        )
      }
    >
      {props.children}
    </BaseTemplate>
  );
}
