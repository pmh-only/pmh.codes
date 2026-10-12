import type { APIRoute } from 'astro';
import { visibleCategories as categories } from '../lib/services';

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export const GET: APIRoute = ({ site }) => {
  const publicUrls = categories
    .flatMap(category => ('allPrivate' in category && category.allPrivate) ? [] : category.services)
    .filter(service => !('private' in service && service.private))
    .filter(service => new URL(service.url).href !== site?.href)
    .map(service => `  <url>\n    <loc>${escapeXml(`${service.url.replace(/\/$/, '')}/`)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`)
    .join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(site!.href)}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${publicUrls}
</urlset>
`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
