import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

// Paths that require admin access
const adminPaths = ['/admin', '/api/admin'];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Check if the request is for an admin or protected resource
    const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

    if (isAdminPath && pathname !== '/admin/login') {
        // For API routes, handle in the route handlers themselves using auth middleware
        // For page routes, NextAuth handles redirects
        if (pathname.startsWith('/admin')) {
            const token = await getToken({
                req: request,
                secret: process.env.NEXTAUTH_SECRET
            });

            if (!token || token.role !== 'admin') {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
