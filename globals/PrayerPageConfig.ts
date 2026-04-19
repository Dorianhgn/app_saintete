import type { GlobalConfig } from 'payload'

export const PrayerPageConfig: GlobalConfig = {
  slug: 'prayer-page-config',
  fields: [
    { name: 'intro_text', type: 'richText' },
    { name: 'catechese_title', type: 'text', defaultValue: "Qu'est-ce que la prière ?" },
    { name: 'catechese_content', type: 'richText' },
  ],
}
