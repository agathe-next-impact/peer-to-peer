import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairemancipation.fr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Routes statiques
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/ressources`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/annuaire`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/agenda`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/actualites`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/cgu`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    {
      url: `${BASE_URL}/politique-confidentialite`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/mentions-legales`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Routes dynamiques — articles de blog
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_URL;
    if (apiUrl) {
      const res = await fetch(`${apiUrl}/api/articles?fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=1000`, {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const json = await res.json();
        blogRoutes = (json.data || []).map((article: { slug: string; updatedAt: string }) => ({
          url: `${BASE_URL}/blog/${article.slug}`,
          lastModified: article.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    }
  } catch {
    // Strapi unavailable — skip dynamic routes
  }

  // Routes dynamiques — structures
  let structureRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_URL;
    if (apiUrl) {
      const res = await fetch(`${apiUrl}/api/structures?fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=1000`, {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const json = await res.json();
        structureRoutes = (json.data || []).map((structure: { slug: string; updatedAt: string }) => ({
          url: `${BASE_URL}/annuaire/${structure.slug}`,
          lastModified: structure.updatedAt,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }));
      }
    }
  } catch {
    // skip
  }

  // Routes dynamiques — événements
  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_URL;
    if (apiUrl) {
      const res = await fetch(`${apiUrl}/api/events?fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=1000`, {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const json = await res.json();
        eventRoutes = (json.data || []).map((event: { slug: string; updatedAt: string }) => ({
          url: `${BASE_URL}/agenda/${event.slug}`,
          lastModified: event.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
      }
    }
  } catch {
    // skip
  }

  return [...staticRoutes, ...blogRoutes, ...structureRoutes, ...eventRoutes];
}
