import type { CollectionConfig } from 'payload'

export const Mysteries: CollectionConfig = {
  slug: 'mysteries',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'mystery_type',
      type: 'select',
      required: true,
      options: [
        { label: 'Joyeux', value: 'joyeux' },
        { label: 'Douloureux', value: 'douloureux' },
        { label: 'Glorieux', value: 'glorieux' },
        { label: 'Lumineux', value: 'lumineux' },
      ],
    },
    { name: 'order', type: 'number', required: true,
      admin: { description: '1 to 5' } },
    { name: 'fruit', type: 'text', required: true },
    { name: 'introduction', type: 'richText',
      admin: { description: 'Shown before the 5 mysteries for this type. JP2 quote, theological intro, etc.' } },
    {
      name: 'days',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Lundi', value: 'lundi' },
        { label: 'Mardi', value: 'mardi' },
        { label: 'Mercredi', value: 'mercredi' },
        { label: 'Jeudi', value: 'jeudi' },
        { label: 'Vendredi', value: 'vendredi' },
        { label: 'Samedi', value: 'samedi' },
        { label: 'Dimanche', value: 'dimanche' },
      ],
    },
    {
      name: 'readings',
      type: 'array',
      fields: [
        { name: 'source_key', type: 'text', required: true,
          admin: { description: 'Lowercase kebab-case key. e.g. st-luc, st-marc, sainte-rita' } },
        { name: 'source_label', type: 'text', required: true,
          admin: { description: 'Display name. e.g. Évangile selon Saint Luc' } },
        { name: 'content', type: 'richText', required: true },
      ],
    },
    { name: 'audio_meditation', type: 'upload', relationTo: 'media' },
  ],
}
