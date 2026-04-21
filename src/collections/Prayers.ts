import type { CollectionConfig } from 'payload'

export const Prayers: CollectionConfig = {
  slug: 'prayers',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'prayer-categories',
      required: true,
    },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'audio', type: 'upload', relationTo: 'media' },
  ],
}
