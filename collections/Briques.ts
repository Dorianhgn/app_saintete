import type { CollectionConfig } from 'payload'

export const Briques: CollectionConfig = {
  slug: 'briques',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'text',
      options: [
        { label: 'Texte', value: 'text' },
        { label: 'Audio', value: 'audio' },
      ],
    },
    { name: 'audio_file', type: 'upload', relationTo: 'media' },
    { name: 'target', type: 'relationship', relationTo: 'godchildren',
      admin: { description: 'Leave empty to send to all godchildren.' } },
    { name: 'scheduled_date', type: 'date' },
    { name: 'published', type: 'checkbox', defaultValue: false },
  ],
}
