import type { CollectionConfig } from 'payload'

export const Prayers: CollectionConfig = {
  slug: 'prayers',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Base (Actes, Credo…)', value: 'base' },
        { label: 'Chapelet', value: 'chapelet' },
        { label: 'Angélus', value: 'angelus' },
        { label: 'Intercession', value: 'intercession' },
        { label: 'Litanie', value: 'litanie' },
      ],
    },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'audio', type: 'upload', relationTo: 'media' },
  ],
}
