import { NextResponse } from 'next/server';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { emitProductUpdated, emitProductDeleted, emitLowStockAlert } from '@/lib/socketEvents';
import { LOW_STOCK_THRESHOLD } from '@/lib/socketConfig';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const product = await Product.findById(params.id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        // Admin Authentication check
        const admin = await requireAdmin();
        if (!admin) return forbiddenResponse('Admin access required');
        await dbConnect();
        const data = await request.json();

        const product = await Product.findByIdAndUpdate(params.id, data, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Emit real-time event
        emitProductUpdated(product.toObject());

        // Check for low stock
        if (product.stock <= LOW_STOCK_THRESHOLD) {
            emitLowStockAlert(product.toObject());
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        // Admin Authentication check
        const admin = await requireAdmin();
        if (!admin) return forbiddenResponse('Admin access required');
        await dbConnect();
        const product = await Product.findByIdAndDelete(params.id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Emit real-time event
        emitProductDeleted(params.id);

        return NextResponse.json({ message: 'Product deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
