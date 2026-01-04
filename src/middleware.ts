import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication
const protectedRoutes = ['/account', '/checkout'];

// Routes that require admin role
const adminRoutes = ['/admin'];

// API routes that require admin role (for mutations)
const adminApiRoutes = ['/api/admin'];

// API routes that require authentication
const protectedApiRoutes = ['/api/user', '/api/orders'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from the request
  // Use secureCookie in production (HTTPS) with correct cookie name
  const isProduction = process.env.NODE_ENV === 'production';
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isProduction,
    cookieName: isProduction 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token',
  });
  
  const isAuthenticated = !!token;
  const isAdmin = token?.role === 'admin';
  
  // Check if accessing admin routes
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAdminApiRoute = adminApiRoutes.some(route => pathname.startsWith(route));
  
  // Check if accessing protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));
  
  // Handle admin routes - require admin role
  if (isAdminRoute) {
    if (!isAuthenticated) {
      // Redirect to login with callback URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'SessionRequired');
      return NextResponse.redirect(loginUrl);
    }
    
    if (!isAdmin) {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  // Handle admin API routes - require admin role
  if (isAdminApiRoute) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
  }
  
  // Handle protected routes - require authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Handle protected API routes - require authentication
  if (isProtectedApiRoute && !isAuthenticated) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Redirect authenticated users away from login/register pages
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    // If admin, redirect to admin dashboard
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Otherwise redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all admin routes
    '/admin/:path*',
    // Match protected routes
    '/account/:path*',
    '/checkout/:path*',
    // Match protected API routes
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/orders/:path*',
    // Match auth pages (for redirect logic)
    '/login',
    '/register',
  ],
};


