import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';
import { createOrderFromCheckout, OrderValidationError } from '@/lib/orderService';
import { emitOrderCreated, emitProductStockUpdated, emitLowStockAlert } from '@/lib/socketEvents';
import { LOW_STOCK_THRESHOLD } from '@/lib/socketConfig';

export async function POST(request: Request) {
    try {
        const user = await requireAuth();
        if (!user || !user.id) return unauthorizedResponse('Please sign in to place an order');
        await dbConnect();
        
        const data = await request.json();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderData } = data;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderData) {
            return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error('RAZORPAY_KEY_SECRET is not defined');
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // Signature is valid, create the order
        const paymentOptions = {
            method: 'razorpay',
            transactionId: razorpay_payment_id,
            status: 'completed',
        };

        const { order, products } = await createOrderFromCheckout(user.id, orderData, paymentOptions);

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
        console.error('Payment verification error:', error);
        return NextResponse.json({ error: 'Failed to verify payment and create order' }, { status: 500 });
    }
}
