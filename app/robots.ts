import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://namtanfilm.com'; // Change this to your final domain later

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/profile/', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
