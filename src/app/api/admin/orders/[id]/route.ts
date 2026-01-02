import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';
import { emitOrderCreated, emitProductStockUpdated, emitLowStockAlert } from '@/lib/socketEvents';
import { LOW_STOCK_THRESHOLD } from '@/lib/socketConfig';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) return forbiddenResponse('Admin access required');

    await dbConnect();
    const data = await request.json();

    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Update status and tracking
    if (data.status && data.status !== order.status) {
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({ status: data.status, notes: `Updated by ${admin.email || admin.id}` });
      order.status = data.status;
    }

    if (data.trackingNumber) {
      order.trackingNumber = data.trackingNumber;
    }

    await order.save();

    // Emit real-time update
    try {
      const populated = await Order.findById(order._id).populate('items.product');
      // Using a generic emitOrderCreated name for now to reuse event
      emitOrderCreated(populated?.toObject() || order.toObject());
    } catch (e) {
      // ignore emit errors
      console.error('Emit order update failed', e);
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Admin order update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update order' }, { status: 500 });
  }
}
