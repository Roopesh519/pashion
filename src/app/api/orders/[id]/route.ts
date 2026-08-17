import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { forbiddenResponse, requireAuth, unauthorizedResponse } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        const user = await requireAuth();
        if (!user || !(user as any).id) return unauthorizedResponse('Please sign in to view an order');
        await dbConnect();
        const order = await Order.findById(id).populate('items.product');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.user?.toString() !== (user as any).id && (user as any).role !== 'admin') {
            return forbiddenResponse('You can only access your own orders');
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
