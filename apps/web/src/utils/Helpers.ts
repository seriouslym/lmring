import { I18nConfig } from '@lmring/i18n';

// Re-export URL functions from BaseUrl.ts to maintain backward compatibility
export { getAuthBaseUrl, getBaseUrl } from './BaseUrl';

export const getI18nPath = (url: string, locale: string) => {
  if (locale === I18nConfig.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

export const isServer = () => {
  return typeof window === 'undefined';
};
