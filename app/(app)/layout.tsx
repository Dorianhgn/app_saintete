import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import '../globals.css'

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Sainteté',
  description: 'Compagnon de prière',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${cormorant.className} min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
