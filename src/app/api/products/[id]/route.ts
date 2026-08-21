import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { emitProductUpdated, emitProductDeleted, emitLowStockAlert } from '@/lib/socketEvents';
import { LOW_STOCK_THRESHOLD } from '@/lib/socketConfig';

const productFields = ['name', 'description', 'price', 'images', 'category', 'slug', 'sizes', 'colors', 'stock', 'isFeatured', 'badge'] as const;

function pickProductFields(data: unknown) {
    if (!data || typeof data !== 'object') return {};
    const input = data as Record<string, unknown>;
    return productFields.reduce<Record<string, unknown>>((product, field) => {
        if (input[field] !== undefined) product[field] = input[field];
        return product;
    }, {});
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        await dbConnect();
        const product = await Product.findById(id);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        const admin = await requireAdmin();
        if (!admin) return forbiddenResponse('Admin access required');
        await dbConnect();
        const data = pickProductFields(await request.json());
        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: 'No valid product fields provided' }, { status: 400 });
        }
        if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0 || !isFinite(data.price as number))) {
            return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 });
        }
        if (data.stock !== undefined && (!Number.isInteger(data.stock) || (data.stock as number) < 0)) {
            return NextResponse.json({ error: 'Stock must be a non-negative integer' }, { status: 400 });
        }
        if (data.category !== undefined) {
            if (typeof data.category !== 'string' || !(data.category as string).trim()) {
                return NextResponse.json({ error: 'Category must be a non-empty string' }, { status: 400 });
            }

            const categoryExists = await Category.findOne({ name: (data.category as string).trim() }).select('_id').lean();
            if (!categoryExists) {
                return NextResponse.json({ error: 'Please select a valid category' }, { status: 400 });
            }
        }

        const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        emitProductUpdated(product.toObject());
        if (product.stock <= LOW_STOCK_THRESHOLD) emitLowStockAlert(product.toObject());

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        const admin = await requireAdmin();
        if (!admin) return forbiddenResponse('Admin access required');
        await dbConnect();
        const product = await Product.findByIdAndDelete(id);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        emitProductDeleted(id);
        return NextResponse.json({ message: 'Product deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
