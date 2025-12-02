import { routing } from '@lmring/i18n';
import { describe, expect, it, vi } from 'vitest';
import { getI18nPath } from './Helpers';

vi.mock('@lmring/env', () => ({
  env: {
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  },
}));

describe('Helpers', () => {
  describe('getI18nPath function', () => {
    it('should not change the path for default language', () => {
      const url = '/random-url';
      const locale = routing.defaultLocale;

      expect(getI18nPath(url, locale)).toBe(url);
    });

    it('should prepend the locale to the path for non-default language', () => {
      const url = '/random-url';
      const locale = 'fr';

      expect(getI18nPath(url, locale)).toMatch(/^\/fr/);
    });
  });
});
