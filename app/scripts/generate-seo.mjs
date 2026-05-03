import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const fallbackSiteUrl = 'http://localhost:3000';
const routes = ['/', '/superpowers'];

export function getSiteUrl() {
  const rawSiteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL;

  if (!rawSiteUrl) {
    console.warn(
      `[seo] SITE_URL/VITE_SITE_URL is not set. Using ${fallbackSiteUrl} for local build output. Set SITE_URL or VITE_SITE_URL in production.`,
    );
    return fallbackSiteUrl;
  }

  const siteUrl = rawSiteUrl.replace(/\/+$/, '');
  try {
    new URL(siteUrl);
  } catch {
    throw new Error(`[seo] Invalid SITE_URL/VITE_SITE_URL: ${rawSiteUrl}`);
  }

  return siteUrl;
}

function routeUrl(siteUrl, route) {
  return `${siteUrl}${route === '/' ? '/' : route}`;
}

export async function generateSeoFiles(siteUrl = getSiteUrl()) {
  const publicDir = path.join(process.cwd(), 'public');
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const robotsTxt = [`User-agent: *`, `Allow: /`, `Sitemap: ${sitemapUrl}`, ``].join('\n');
  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map((route) => `  <url><loc>${routeUrl(siteUrl, route)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  const redirects = `/* /index.html 200\n`;

  await Promise.all([
    writeFile(path.join(publicDir, 'robots.txt'), robotsTxt),
    writeFile(path.join(publicDir, 'sitemap.xml'), sitemapXml),
    writeFile(path.join(publicDir, '_redirects'), redirects),
  ]);

  console.log(`[seo] Generated robots.txt, sitemap.xml, and _redirects for ${siteUrl}`);
  return siteUrl;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateSeoFiles();
}
