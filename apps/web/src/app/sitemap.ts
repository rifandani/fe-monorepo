import type { MetadataRoute } from 'next'
import fs from 'node:fs'

const appFolders = fs.readdirSync('app', { withFileTypes: true })
const pages = appFolders
  .filter(file => file.isDirectory())
  .filter(folder => !folder.name.startsWith('_'))
  .filter(folder => !folder.name.startsWith('('))
  .map(folder => folder.name)
// TODO: change production url when you know
const url = new URL(
  process.env.NODE_ENV === 'production' ? 'https://rifandani.com' : 'http://localhost:3002',
)

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: new URL('/', url).href,
      lastModified: new Date(),
      // priority: 1,
      // images: [new URL('/image.jpg', url).href],
      // videos: [
      //   {
      //     title: 'example',
      //     thumbnail_loc: new URL('/image.jpg', url).href,
      //     description: 'this is the description',
      //   },
      // ],
    },
    ...pages.map(page => ({
      url: new URL(page, url).href,
      lastModified: new Date(),
    })),
  ]
}
