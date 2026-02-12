import fs from 'node:fs'
import { simpleSitemapAndIndex } from 'sitemap'

const OUTPUT_PATH = './public/sitemap.xml'
// TODO: change this to the production domain when we know it
const DOMAIN = process.env.NODE_ENV === 'production' ? 'https://rifandani.com' : 'http://localhost:3001'

console.log('🚀 Generating sitemap...')

// writes sitemaps and index out to the destination you provide.
simpleSitemapAndIndex({
  gzip: false,
  hostname: DOMAIN,
  destinationDir: './public',
  sourceData: [
    { url: '/', lastmod: new Date().toISOString() },
    { url: '/login', lastmod: new Date().toISOString() },
  ],
}).then(() => {
  console.log(`✅ Sitemap generated successfully at: ${OUTPUT_PATH}`)
  console.log(`🌐 Domain: ${DOMAIN}`)

  // rename the generated file "sitemap-0.xml" to "sitemap.xml"
  fs.renameSync('public/sitemap-0.xml', 'public/sitemap.xml')

  // delete the file "sitemap-index.xml"
  fs.unlinkSync('public/sitemap-index.xml')
}).catch((error) => {
  console.error('❌ Error generating sitemap:', error)
  process.exit(1)
})
