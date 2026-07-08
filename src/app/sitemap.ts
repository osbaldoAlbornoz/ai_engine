import { MetadataRoute } from 'next';
import { hardwareData } from '@/data/hardware';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aiengine.example.com';

  const products = hardwareData.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...products,
  ];
}
