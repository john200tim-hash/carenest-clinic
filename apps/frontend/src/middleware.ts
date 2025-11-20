import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Get the authentication token from the request's cookies
  const adminToken = request.cookies.get('adminToken')?.value;

  // 2. Define which routes are protected for doctors
  // The main /patients dashboard and the /appointments dashboard are protected.
  // Individual patient records (/patients/[id]) are public.
  const isDoctorDashboard = request.nextUrl.pathname === '/patients';

  const isProtectedRoute = isDoctorDashboard ||
                         request.nextUrl.pathname.startsWith('/admin') ||
                         request.nextUrl.pathname.startsWith('/appointments');
  
  const isLoginPage = request.nextUrl.pathname.startsWith('/doctors/login');

  // 3. If the user is trying to access a protected route without a token, redirect them
  if (isProtectedRoute && !isLoginPage && !adminToken) {
    return NextResponse.redirect(new URL('/doctors/login', request.url));
  }

  // 4. Otherwise, allow the request to continue
  return NextResponse.next();
}

// 5. Configure the middleware to only run on specific paths for better performance
export const config = {
  matcher: ['/patients', '/patients/:id*', '/admin/:path*', '/appointments/:path*'],
};