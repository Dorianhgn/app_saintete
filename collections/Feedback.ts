import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  admin: { useAsTitle: 'reaction' },
  fields: [
    { name: 'brique', type: 'relationship', relationTo: 'briques', required: true },
    { name: 'godchild', type: 'relationship', relationTo: 'godchildren', required: true },
    {
      name: 'reaction',
      type: 'select',
      options: [
        { label: '🙏', value: 'pray' },
        { label: '❤️', value: 'love' },
        { label: '✝️', value: 'cross' },
      ],
    },
    { name: 'message', type: 'text' },
    { name: 'read_at', type: 'date' },
  ],
}
