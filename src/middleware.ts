import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ---------------------------------------------------------------------------
// In-memory rate limiter (sliding window)
// Works on self-hosted (server.js). On Vercel, vercel.json handles this.
// ---------------------------------------------------------------------------
interface RateLimitEntry { count: number; windowStart: number; }
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS: { pattern: RegExp; method?: string; max: number; windowMs: number }[] = [
  // Auth endpoints — tight limit to slow brute-force
  { pattern: /^\/api\/auth\//, method: 'POST', max: 10, windowMs: 60_000 },
  // Order creation
  { pattern: /^\/api\/orders$/, method: 'POST', max: 10, windowMs: 60_000 },
  // General API mutations
  { pattern: /^\/api\//, method: 'POST', max: 30, windowMs: 60_000 },
  { pattern: /^\/api\//, method: 'PUT',  max: 30, windowMs: 60_000 },
  { pattern: /^\/api\//, method: 'DELETE', max: 30, windowMs: 60_000 },
];

function checkRateLimit(ip: string, pathname: string, method: string): boolean {
  const rule = RATE_LIMITS.find(
    r => r.pattern.test(pathname) && (!r.method || r.method === method)
  );
  if (!rule) return true;

  const key = `${ip}:${method}:${pathname}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > rule.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= rule.max) return false;
  entry.count++;
  return true;
}

// Prune stale entries every 5 minutes to prevent unbounded memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
      if (now - entry.windowStart > 120_000) rateLimitStore.delete(key);
    }
  }, 300_000);
}


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
  const method = request.method;

  // Rate limiting (self-hosted guard — Vercel uses vercel.json firewall rules)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip, pathname, method)) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  // Get the token from the request
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
    '/admin/:path*',
    '/account/:path*',
    '/checkout/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/orders/:path*',
    '/api/auth/:path*',
    '/api/products/:path*',
    '/login',
    '/register',
  ],
};


