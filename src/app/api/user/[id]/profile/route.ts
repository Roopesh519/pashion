import { NextResponse } from 'next/server';
import { requireAuth, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

interface RouteParams {
    params: {
        id: string;
    };
}

/**
 * GET /api/user/[id]/profile - Get user profile
 */
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await requireAuth();
        if (!user) {
            return unauthorizedResponse('Please sign in');
        }

        await dbConnect();

        // Verify user can only access their own profile (unless admin)
        if ((user as any).id !== params.id && (user as any).role !== 'admin') {
            return forbiddenResponse('You can only access your own profile');
        }

        const userProfile = await User.findById(params.id)
            .select('-password')
            .lean();

        if (!userProfile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: userProfile }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/user/[id]/profile - Update user profile
 */
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const user = await requireAuth();
        if (!user) {
            return unauthorizedResponse('Please sign in');
        }

        // Verify user can only update their own profile (unless admin)
        if ((user as any).id !== params.id && (user as any).role !== 'admin') {
            return forbiddenResponse('You can only update your own profile');
        }

        await dbConnect();
        const data = await request.json();

        // Prevent updating sensitive fields
        const allowedFields = ['name', 'image', 'phone', 'address', 'preferences'];
        const updateData: any = {};

        allowedFields.forEach((field) => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });

        const updatedUser = await User.findByIdAndUpdate(
            params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        return NextResponse.json(
            { message: 'Profile updated successfully', user: updatedUser },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}
