import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';
import { emitOrderStatusUpdated } from '@/lib/socketEvents';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        const admin = await requireAdmin();
        if (!admin) return forbiddenResponse('Admin access required');

        await dbConnect();
        const data = await request.json();

        const order = await Order.findById(id);
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        if (data.status && !VALID_STATUSES.includes(data.status)) {
            return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
        }
        if (data.status && data.status !== order.status) {
            order.statusHistory = order.statusHistory || [];
            order.statusHistory.push({ status: data.status, notes: `Updated by ${(admin as any).email || (admin as any).id}` });
            order.status = data.status;
        }

        if (data.trackingNumber !== undefined) {
            if (typeof data.trackingNumber !== 'string' || data.trackingNumber.length > 100) {
                return NextResponse.json({ error: 'Invalid tracking number' }, { status: 400 });
            }
            order.trackingNumber = data.trackingNumber.trim();
        }

        await order.save();

        try {
            emitOrderStatusUpdated(order._id.toString(), order.status);
        } catch { /* socket not available in serverless */ }

        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update order' }, { status: 500 });
    }
}
