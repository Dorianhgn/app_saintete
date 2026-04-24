import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { Godchildren } from './collections/Godchildren.ts'
import { Saints } from './collections/Saints.ts'
import { Prayers } from './collections/Prayers.ts'
import { Mysteries } from './collections/Mysteries.ts'
import { Briques } from './collections/Briques.ts'
import { Feedback } from './collections/Feedback.ts'
import { PrayerCategories } from './collections/PrayerCategories.ts'
import { PrayerPageConfig } from './globals/PrayerPageConfig.ts'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

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
      upload: true,
      fields: [{ name: 'alt', type: 'text' }],
    },
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
  ],
  plugins: [
    vercelBlobStorage({
      enabled: true, // On l'active
      collections: {
        media: true, // On cible la collection 'media'
      },
      // Le token récupéré via la variable d'env de Vercel
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
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
