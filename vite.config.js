import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

/**
 * SEO: set SITE_URL (e.g. SITE_URL=https://www.electrohub.dz npm run build) to get absolute
 * canonical / Open Graph URLs in index.html plus a generated sitemap.xml and robots.txt.
 * Without it the absolute-only tags are dropped and the app fills canonical in at runtime.
 */
function seo(siteUrl) {
  const base = (siteUrl || '').replace(/\/+$/, '')
  return {
    name: 'electrohub-seo',
    transformIndexHtml(html) {
      if (base) return html.replaceAll('__SITE_URL__', base)
      return html
        .replace(/\s*<link rel="canonical"[^>]*>/, '')
        .replace(/\s*<meta property="og:url"[^>]*>/, '')
        .replaceAll('__SITE_URL__', '')
    },
    generateBundle() {
      if (!base) return
      const today = new Date().toISOString().slice(0, 10)
      const urls = [
        ['/', '1.0', 'daily'],
        ['/shop', '0.9', 'daily'],
        ['/compare', '0.5', 'monthly'],
      ]
      const xml =
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls
          .map(([p, prio, freq]) => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`)
          .join('\n') +
        '\n</urlset>\n'
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /profile\nDisallow: /login\n\nSitemap: ${base}/sitemap.xml\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.API_PROXY || 'http://localhost:5000'
  return {
    plugins: [react(), tailwindcss(), seo(env.SITE_URL || env.VITE_SITE_URL)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      assetsInlineLimit: 2048,
      chunkSizeWarningLimit: 700,
    },
    server: {
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
    preview: {
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})
