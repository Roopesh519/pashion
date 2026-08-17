import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { emitOrderCreated, emitProductStockUpdated, emitLowStockAlert } from '@/lib/socketEvents';
import { LOW_STOCK_THRESHOLD } from '@/lib/socketConfig';
import { forbiddenResponse, requireAdmin, requireAuth, unauthorizedResponse } from '@/lib/auth';
import { createOrderFromCheckout, OrderValidationError } from '@/lib/orderService';

export async function GET(request: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) return forbiddenResponse('Admin access required');
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        const query: Record<string, string> = {};
        if (userId) query.user = userId;
        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('items.product')
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAuth();
        if (!user || !user.id) return unauthorizedResponse('Please sign in to place an order');
        await dbConnect();
        const { order, products } = await createOrderFromCheckout(user.id, await request.json());

        for (const product of products) {
            emitProductStockUpdated(product._id.toString(), product.stock);
            if (product.stock <= LOW_STOCK_THRESHOLD) emitLowStockAlert(product);
        }

        // Emit order created event
        emitOrderCreated(order?.toObject());

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        if (error instanceof OrderValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
