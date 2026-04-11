import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sainteté',
  description: 'Compagnon de prière',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${geist.className} bg-gray-950 text-gray-100 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
