import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the route is an admin route (but exclude login and unauthorized pages)
  if (req.nextUrl.pathname.startsWith('/admin') && 
      !req.nextUrl.pathname.startsWith('/admin/login') && 
      !req.nextUrl.pathname.startsWith('/admin/unauthorized')) {
    
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session, redirect to admin login
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Check if user has admin role (you'll need to set this up in your database)
    const { data: profile, error: profileError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    console.log('🔍 Middleware - User ID:', session.user.id)
    console.log('🔍 Middleware - Profile:', profile)
    console.log('🔍 Middleware - Profile Error:', profileError)

    if (profileError || !profile || profile.role !== 'admin') {
      console.log('❌ Middleware - Redirecting to unauthorized')
      return NextResponse.redirect(new URL('/admin/unauthorized', req.url))
    }

    console.log('✅ Middleware - Admin access granted')
  }

  return res
}

export const config = {
  matcher: ['/admin/dashboard/:path*']  // Only protect dashboard, not login
}
