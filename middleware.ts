import { getServerSession } from 'next-auth/next';
import { authOptions } from './src/lib/authConfig';
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
            const session = await getServerSession(authOptions);
            const user = session?.user as any;

            if (!session || user?.role !== 'admin') {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
