import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAuth, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const user = await requireAuth();
        if (!user) return unauthorizedResponse('Please sign in');

        await dbConnect();

        if ((user as any).id !== id && (user as any).role !== 'admin') {
            return forbiddenResponse('You can only access your own profile');
        }

        const userProfile = await User.findById(id).select('-password').lean();
        if (!userProfile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ user: userProfile }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const user = await requireAuth();
        if (!user) return unauthorizedResponse('Please sign in');

        if ((user as any).id !== id && (user as any).role !== 'admin') {
            return forbiddenResponse('You can only update your own profile');
        }

        await dbConnect();
        const data = await request.json();
        if (!data || typeof data !== 'object') return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        const allowedFields = ['name', 'image', 'phone', 'address', 'preferences'];
        const updateData: any = {};
        allowedFields.forEach((field) => {
            if (data[field] !== undefined) updateData[field] = data[field];
        });

        if (updateData.name !== undefined) {
            if (typeof updateData.name !== 'string' || !updateData.name.trim() || updateData.name.trim().length > 60) {
                return NextResponse.json({ error: 'Name must be a non-empty string under 60 characters' }, { status: 400 });
            }
            updateData.name = updateData.name.trim();
        }
        if (updateData.phone !== undefined) {
            if (typeof updateData.phone !== 'string' || updateData.phone.trim().length > 20) {
                return NextResponse.json({ error: 'Phone must be a string under 20 characters' }, { status: 400 });
            }
            updateData.phone = updateData.phone.trim();
        }
        if (updateData.address !== undefined && (typeof updateData.address !== 'object' || Array.isArray(updateData.address))) {
            return NextResponse.json({ error: 'Address must be an object' }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update profile' }, { status: 500 });
    }
}
