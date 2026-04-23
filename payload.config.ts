import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { Godchildren } from './collections/Godchildren'
import { Saints } from './collections/Saints'
import { Prayers } from './collections/Prayers'
import { Mysteries } from './collections/Mysteries'
import { Briques } from './collections/Briques'
import { Feedback } from './collections/Feedback'
import { PrayerCategories } from './collections/PrayerCategories'
import { PrayerPageConfig } from './globals/PrayerPageConfig'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: { user: 'users' },
  collections: [
    Godchildren,
    Saints,
    Prayers,
    Mysteries,
    Briques,
    Feedback,
    PrayerCategories,
    {
      slug: 'media',
      upload: {
        staticDir: path.resolve(dirname, 'media'),
      },
      fields: [{ name: 'alt', type: 'text' }],
    },
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
  ],
  globals: [PrayerPageConfig],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? (() => { throw new Error('PAYLOAD_SECRET is required') })(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { 
    // On accepte les variables générées par Vercel/Neon en plus de la tienne
    connectionString: process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL || (() => { throw new Error('Database connection string is required') })() },
  }),
  sharp,
})
