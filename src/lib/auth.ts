import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authConfig';
import { NextResponse } from 'next/server';

/**
 * Get the authenticated user session
 */
export async function getAuthSession() {
    return await getServerSession(authOptions);
}

/**
 * Check if user is authenticated (middleware helper)
 */
export async function requireAuth() {
    const session = await getAuthSession();
    if (!session || !session.user) {
        return null;
    }
    return session.user;
}

/**
 * Check if user is admin (middleware helper)
 */
export async function requireAdmin() {
    const session = await getAuthSession();
    const user = session?.user as any;
    if (!session || !user || user.role !== 'admin') {
        return null;
    }
    return user;
}

/**
 * Middleware response for unauthorized access
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
    return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Middleware response for forbidden access
 */
export function forbiddenResponse(message: string = 'Forbidden') {
    return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Extract user ID from session
 */
export function getUserIdFromSession(session: any): string | null {
    return session?.user?.id || null;
}
