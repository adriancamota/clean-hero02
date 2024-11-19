import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserByEmail } from './utils/db/actions'

export async function middleware(request: NextRequest) {
  // Check if the route is admin-related
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const userEmail = request.cookies.get('userEmail')?.value

    if (!userEmail) {
      console.log('No userEmail cookie found');
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      const user = await getUserByEmail(userEmail)
      
      if (!user?.isAdmin) {
        console.log('User is not admin:', userEmail);
        return NextResponse.redirect(new URL('/', request.url))
      }
      
      // User is admin, allow access
      return NextResponse.next()
    } catch (error) {
      console.error('Error checking admin status:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
} 