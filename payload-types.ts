/**
 * This file was manually created from collection definitions.
 * Regenerate with: npx payload generate:types (requires working DB connection)
 */

export interface Media {
  id: number
  alt?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
  url?: string | null
  updatedAt: string
  createdAt: string
}

export interface User {
  id: number
  email: string
  updatedAt: string
  createdAt: string
}

export interface Saint {
  id: number
  name: string
  slug: string
  feast_day?: string | null
  description?: unknown
  image?: number | Media | null
  prayers?: (number | Prayer)[] | null
  updatedAt: string
  createdAt: string
}

export interface Prayer {
  id: number
  title: string
  content: unknown
  category: 'base' | 'chapelet' | 'angelus' | 'intercession' | 'litanie'
  tags?: { tag?: string | null; id?: string | null }[] | null
  audio?: number | Media | null
  updatedAt: string
  createdAt: string
}

export interface Mystery {
  id: number
  name: string
  mystery_type: 'joyeux' | 'douloureux' | 'glorieux' | 'lumineux'
  order: number
  fruit: string
  introduction?: unknown
  days?: ('lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche')[] | null
  readings?:
    | {
        source_key: string
        source_label: string
        content: unknown
        id?: string | null
      }[]
    | null
  audio_meditation?: number | Media | null
  updatedAt: string
  createdAt: string
}

export interface Brique {
  id: number
  title: string
  content: unknown
  type?: 'text' | 'audio' | null
  audio_file?: number | Media | null
  target?: number | Godchild | null
  scheduled_date?: string | null
  published?: boolean | null
  updatedAt: string
  createdAt: string
}

export interface Feedback {
  id: number
  brique: number | Brique
  godchild: number | Godchild
  reaction?: 'pray' | 'love' | 'cross' | null
  message?: string | null
  read_at?: string | null
  updatedAt: string
  createdAt: string
}

export interface Godchild {
  id: number
  name: string
  slug: string
  token?: string | null
  patron_saint?: number | Saint | null
  theme_color?: 'violet' | 'blanc' | 'vert' | 'rouge' | 'or' | null
  active?: boolean | null
  allowed_sources?: { source_key: string; id?: string | null }[] | null
  push_subscription?: unknown
  updatedAt: string
  createdAt: string
}

export interface Config {
  collections: {
    godchildren: Godchild
    saints: Saint
    prayers: Prayer
    mysteries: Mystery
    briques: Brique
    feedback: Feedback
    media: Media
    users: User
  }
}
