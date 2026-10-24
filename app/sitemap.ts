import type { MetadataRoute } from 'next'
import { getAllProjectSlugs, getContentLastUpdated } from '@/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://manishkumawat.com'
  const [slugs, lastUpdated] = await Promise.all([
    getAllProjectSlugs(),
    getContentLastUpdated(),
  ])

  const lastModified = lastUpdated ? new Date(lastUpdated) : new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/archive`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  const projectRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${siteUrl}/work/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...projectRoutes]
}
