import type { CollectionConfig } from 'payload'

export const Saints: CollectionConfig = {
  slug: 'saints',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'feast_day', type: 'text',
      admin: { description: 'Format MM-DD, e.g. 09-29 for Saint Michel' } },
    { name: 'description', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'prayers', type: 'relationship', relationTo: 'prayers', hasMany: true },
  ],
}
