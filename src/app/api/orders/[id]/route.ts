import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { emitOrderStatusUpdated } from '@/lib/socketEvents';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const order = await Order.findById(params.id).populate('items.product');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const data = await request.json();

        const order = await Order.findByIdAndUpdate(params.id, data, {
            new: true,
            runValidators: true,
        }).populate('items.product');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Emit real-time event if status changed
        if (data.status) {
            emitOrderStatusUpdated(params.id, data.status, order.toObject());
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
