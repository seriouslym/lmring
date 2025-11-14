import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/utils/BaseUrl';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/arena',
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
