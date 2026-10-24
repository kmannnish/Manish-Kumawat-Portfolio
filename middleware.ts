import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey || !url.startsWith('http')) {
    // If Supabase credentials are missing, let request pass in dev
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/admin/login'

  // Gate all /admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      if (!isLoginPage) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/admin/login'
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // User is authenticated: check membership in admins table
      const { data: adminRecord } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!adminRecord) {
        // Authenticated user is NOT an admin
        if (!isLoginPage) {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/admin/login'
          redirectUrl.searchParams.set('error', 'unauthorized')
          return NextResponse.redirect(redirectUrl)
        }
      } else if (isLoginPage) {
        // Already authenticated as admin: redirect to admin dashboard
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/admin'
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
