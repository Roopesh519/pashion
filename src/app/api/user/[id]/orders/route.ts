import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAuth, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ orders: [] }, { status: 200 });
        const user = await requireAuth();
        if (!user) return unauthorizedResponse('Please sign in to view your orders');

        await dbConnect();

        if ((user as any).id !== id && (user as any).role !== 'admin') {
            return forbiddenResponse('You can only access your own orders');
        }

        const orders = await Order.find({ user: id })
            .populate('items.product', 'name price images')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ orders }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
