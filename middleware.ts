import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // In a real production environment with @supabase/auth-helpers-nextjs 
  // you would use createMiddlewareClient(req) here.
  // For the current build context, we will perform a soft check for the session cookie.
  
  const hasSession = req.cookies.has('sb-access-token') || req.cookies.has('supabase-auth-token')

  // Protect Dashboard and Manager routes
  if (!hasSession && (
    req.nextUrl.pathname.startsWith('/manager') ||
    req.nextUrl.pathname.startsWith('/courses/builder')
  )) {
    // During demo/development if supabase is not yet configured, 
    // we allow access to avoid blocking the user.
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/manager/:path*', '/courses/builder/:path*'],
}
