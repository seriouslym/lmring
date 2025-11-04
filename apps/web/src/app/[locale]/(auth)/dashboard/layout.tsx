import type { Locale } from '@lmring/i18n';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { auth } from '@/libs/Auth';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: 'DashboardLayout',
  });

  // Check authentication using Better-Auth
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect(locale ? `/${locale}/sign-in` : '/sign-in');
  }

  // TODO: Implement sign-out functionality
  // Create a form action or API route to handle sign out
  return (
    <BaseTemplate
      leftNav={
        <>
          <li>
            <Link href="/dashboard/" className="border-none text-gray-700 hover:text-gray-900">
              {t('dashboard_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/user-profile/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('user_profile_link')}
            </Link>
          </li>
        </>
      }
      rightNav={
        <>
          <li>
            <button className="border-none text-gray-700 hover:text-gray-900" type="button">
              {t('sign_out')}
            </button>
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
