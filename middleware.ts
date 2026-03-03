import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect Dashboard and Manager routes
  if (!session && (
    req.nextUrl.pathname.startsWith('/manager') ||
    req.nextUrl.pathname.startsWith('/courses/builder')
  )) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/manager/:path*', '/courses/builder/:path*'],
}
