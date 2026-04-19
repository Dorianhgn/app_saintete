import type { CollectionConfig } from 'payload'

export const PrayerCategories: CollectionConfig = {
  slug: 'prayer-categories',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'order', type: 'number', required: true },
  ],
}
