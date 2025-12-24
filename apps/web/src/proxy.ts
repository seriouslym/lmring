import { detectBot } from '@arcjet/next';
import type { AuthUser } from '@lmring/auth';
import { isDisabled, isPending, UserStatus } from '@lmring/auth';
import { routing } from '@lmring/i18n';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import arcjet from '@/libs/Arcjet';
import { auth } from '@/libs/Auth';
import { logger } from '@/libs/Logger';

const handleI18nRouting = createMiddleware(routing);

const PROTECTED_PATHS = ['/arena', '/account', '/settings', '/history', '/leaderboard'];
const AUTH_PATHS = ['/sign-in', '/sign-up'];
const ACCOUNT_DISABLED_PATH = '/account-disabled';
const LOCALE_PREFIX_REGEX = /^\/[a-z]{2}(\/|$)/;

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX_REGEX, '/');
}

function matchesAnyPath(pathname: string, paths: string[]): boolean {
  const normalizedPath = stripLocalePrefix(pathname);
  return paths.some((path) => normalizedPath.startsWith(path));
}

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE',
      'CATEGORY:PREVIEW',
      'CATEGORY:MONITOR',
    ],
  }),
);

export default async function proxy(request: NextRequest, _event: NextFetchEvent) {
  // Verify the request with Arcjet
  // Use process.env instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { pathname } = request.nextUrl;
  const locale = pathname.match(LOCALE_PREFIX_REGEX)?.[0]?.replace(/\//g, '') ?? '';

  // Get session from Better-Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const user = session?.user;

  if (user) {
    const authUser = user as unknown as AuthUser;

    if (isDisabled(authUser)) {
      logger.warn('Disabled user attempted to access resource', {
        userId: authUser.id,
        pathname,
      });

      const normalizedPath = stripLocalePrefix(pathname);
      if (normalizedPath !== ACCOUNT_DISABLED_PATH) {
        const accountDisabledUrl = new URL(
          locale ? `/${locale}${ACCOUNT_DISABLED_PATH}` : ACCOUNT_DISABLED_PATH,
          request.url,
        );
        return NextResponse.redirect(accountDisabledUrl);
      }
    }

    if (isPending(authUser)) {
      logger.warn('Pending user attempted to access resource', {
        userId: authUser.id,
        pathname,
      });

      const normalizedPath = stripLocalePrefix(pathname);
      if (normalizedPath !== ACCOUNT_DISABLED_PATH) {
        const accountDisabledUrl = new URL(
          locale ? `/${locale}${ACCOUNT_DISABLED_PATH}` : ACCOUNT_DISABLED_PATH,
          request.url,
        );
        return NextResponse.redirect(accountDisabledUrl);
      }
    }

    const normalizedPath = stripLocalePrefix(pathname);
    if (normalizedPath === ACCOUNT_DISABLED_PATH && authUser.status === UserStatus.ACTIVE) {
      const homeUrl = new URL(locale ? `/${locale}` : '/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  if (matchesAnyPath(pathname, PROTECTED_PATHS) && !user) {
    const signInUrl = new URL(locale ? `/${locale}/sign-in` : '/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (matchesAnyPath(pathname, AUTH_PATHS) && user) {
    const arenaUrl = new URL(locale ? `/${locale}/arena` : '/arena', request.url);
    return NextResponse.redirect(arenaUrl);
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api` (API routes, including auth)
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … if they start with `/shared` (public shared pages, no i18n needed)
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|_next|_vercel|monitoring|shared|.*\\..*).*)',
};
