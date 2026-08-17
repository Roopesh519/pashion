import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const admin = await requireAdmin();
        if (!admin) return forbiddenResponse('Admin access required');

        await dbConnect();
        const data = await request.json();

        if (data.role !== 'user' && data.role !== 'admin') {
            return NextResponse.json({ error: 'Role must be user or admin' }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: { role: data.role } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ message: 'User updated', user });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 500 });
    }
}
