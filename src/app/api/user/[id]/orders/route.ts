import { NextResponse } from 'next/server';
import { requireAuth, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

interface RouteParams {
    params: {
        id: string;
    };
}

/**
 * GET /api/user/orders - Get user's orders (requires auth)
 */
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await requireAuth();
        if (!user) {
            return unauthorizedResponse('Please sign in to view your orders');
        }

        await dbConnect();

        const userId = params.id;
        // Verify user can only access their own orders
        if ((user as any).id !== userId && (user as any).role !== 'admin') {
            return forbiddenResponse('You can only access your own orders');
        }

        const orders = await Order.find({ user: userId })
            .populate('items.product', 'name price images')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ orders }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching user orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/user/[id]/orders/[orderId] - Get specific order details
 */
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const user = await requireAuth();
        if (!user) {
            return unauthorizedResponse('Please sign in');
        }

        await dbConnect();
        const data = await request.json();

        // Verify user can only create orders for themselves (unless admin)
        if ((user as any).id !== data.userId && (user as any).role !== 'admin') {
            return forbiddenResponse('Cannot create order for another user');
        }

        const order = await Order.create({
            user: data.userId,
            customerInfo: data.customerInfo,
            items: data.items,
            subtotal: data.subtotal,
            shippingCost: data.shippingCost,
            tax: data.tax,
            totalAmount: data.totalAmount,
            paymentMethod: data.paymentMethod || 'credit_card',
        });

        return NextResponse.json(
            { message: 'Order created successfully', order },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
