import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { emitOrderCreated, emitProductStockUpdated, emitLowStockAlert } from '@/lib/socketEvents';
import { LOW_STOCK_THRESHOLD } from '@/lib/socketConfig';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        let query: any = {};
        if (userId) query.user = userId;
        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('items.product')
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const data = await request.json();

        // Validate required fields
        if (!data.customerInfo || !data.items || !data.totalAmount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Ensure items have valid product references
        if (!data.items.every((item: any) => item.product)) {
            return NextResponse.json({ error: 'All items must have a product reference' }, { status: 400 });
        }

        // Convert user ID if it exists and is valid
        if (data.user && mongoose.Types.ObjectId.isValid(data.user)) {
            data.user = new mongoose.Types.ObjectId(data.user);
        } else {
            data.user = undefined;
        }

        // Convert product IDs to ObjectId, validating each one
        const invalidItems = data.items.filter((item: any) => !mongoose.Types.ObjectId.isValid(item.product));
        if (invalidItems.length > 0) {
            return NextResponse.json({ 
                error: 'Invalid product ID(s) in cart. Please clear your cart and add items again from the shop.' 
            }, { status: 400 });
        }

        data.items = data.items.map((item: any) => ({
            ...item,
            product: new mongoose.Types.ObjectId(item.product),
        }));

        const order = await Order.create(data);

        // Update product stock and emit real-time events
        for (const item of data.items) {
            if (item.product) {
                const product = await Product.findById(item.product);
                if (product) {
                    const newStock = Math.max(0, product.stock - item.quantity);
                    product.stock = newStock;
                    await product.save();

                    // Emit stock update event
                    emitProductStockUpdated(product._id.toString(), newStock);

                    // Check for low stock
                    if (newStock <= LOW_STOCK_THRESHOLD) {
                        emitLowStockAlert(product.toObject());
                    }
                }
            }
        }

        // Emit order created event
        const populatedOrder = await Order.findById(order._id).populate('items.product');
        emitOrderCreated(populatedOrder?.toObject() || order.toObject());

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Order creation error:', error);
        const errorMessage = (error as any)?.message || 'Failed to create order';
        const statusCode = (error as any)?.statusCode || 500;
        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}
