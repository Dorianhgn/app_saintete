import type { CollectionConfig } from 'payload'
import crypto from 'crypto'

export const Godchildren: CollectionConfig = {
  slug: 'godchildren',
  admin: { useAsTitle: 'name' },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.token) {
          data.token = crypto.randomBytes(12).toString('hex')
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true,
      admin: { description: 'URL-safe, lowercase, no spaces. e.g. martin' } },
    { name: 'token', type: 'text', required: false,
      admin: { readOnly: true, description: 'Auto-generated. Change to revoke access.' } },
    { name: 'patron_saint', type: 'relationship', relationTo: 'saints' },
    {
      name: 'theme_color',
      type: 'select',
      defaultValue: 'violet',
      options: [
        { label: 'Violet (Avent/Carême)', value: 'violet' },
        { label: 'Blanc (Fêtes)', value: 'blanc' },
        { label: 'Vert (Temps ordinaire)', value: 'vert' },
        { label: 'Rouge (Martyrs)', value: 'rouge' },
        { label: 'Or (Solennités)', value: 'or' },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
    {
      name: 'allowed_sources',
      type: 'array',
      admin: { description: 'Reading source keys this godchild can see in the rosary. e.g. st-luc, st-marc, sainte-rita' },
      fields: [
        { name: 'source_key', type: 'text', required: true },
      ],
    },
    {
      name: 'push_subscription',
      type: 'json',
      admin: { readOnly: true, description: 'Web Push subscription. Written client-side on opt-in.' },
    },
  ],
}
