import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect godchild routes, not admin or API
  const { pathname } = request.nextUrl
  const match = pathname.match(/^\/([^/]+)\/([^/]+)/)
  if (!match) return NextResponse.next()

  // Token existence check only — full DB validation happens in layout.tsx
  // (middleware runs on edge, Payload local API needs Node runtime)
  const [, slug, token] = match
  if (!slug || !token || token.length < 16) {
    return new NextResponse(null, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!admin|api|_next|icons|manifest.json).*)'],
}
