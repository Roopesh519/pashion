import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';
import { calculateOrderTotal, OrderValidationError } from '@/lib/orderService';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const user = await requireAuth();
        if (!user || !user.id) return unauthorizedResponse('Please sign in to place an order');
        await dbConnect();
        
        const requestData = await request.json();
        
        // Calculate amount in paise (1 INR = 100 paise)
        const totalAmountCents = await calculateOrderTotal(requestData);
        
        if (totalAmountCents < 100) {
            return NextResponse.json({ error: 'Order amount must be at least 1 INR' }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const receiptId = `receipt_${crypto.randomBytes(8).toString('hex')}`;

        const options = {
            amount: totalAmountCents,
            currency: 'INR',
            receipt: receiptId,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
        });

    } catch (error) {
        if (error instanceof OrderValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error('Razorpay order creation error:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
