import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { emitProductCreated, emitLowStockAlert } from '@/lib/socketEvents';
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

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');

        const query: Record<string, string | boolean> = {};
        if (category) query.category = category;
        if (featured === 'true') query.isFeatured = true;

        const requestedLimit = Number(searchParams.get('limit') || 50);
        const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 50;
        const products = await Product.find(query).sort({ createdAt: -1 }).limit(limit).lean();
        return NextResponse.json({ products }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Admin Authentication check
        const admin = await requireAdmin();
        if (!admin) {
            return forbiddenResponse('Admin access required to create products');
        }

        await dbConnect();
        const data = pickProductFields(await request.json());

        // Validation
        if (!data.name || data.price === undefined || !data.images || !data.category || !data.slug) {
            return NextResponse.json({ error: 'Missing required fields: name, price, images, category, slug' }, { status: 400 });
        }
        if (typeof data.name !== 'string' || (data.name as string).trim().length > 100) {
            return NextResponse.json({ error: 'Name must be a string under 100 characters' }, { status: 400 });
        }
        if (typeof data.price !== 'number' || data.price < 0 || !isFinite(data.price)) {
            return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 });
        }
        if (data.stock !== undefined && (!Number.isInteger(data.stock) || (data.stock as number) < 0)) {
            return NextResponse.json({ error: 'Stock must be a non-negative integer' }, { status: 400 });
        }
        if (!Array.isArray(data.images) || (data.images as string[]).length === 0) {
            return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
        }
        if (typeof data.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug as string)) {
            return NextResponse.json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' }, { status: 400 });
        }

        // Check for duplicate slug
        const existingProduct = await Product.findOne({ slug: data.slug });
        if (existingProduct) {
            return NextResponse.json(
                { error: 'Product with this slug already exists' },
                { status: 409 }
            );
        }

        const product = await Product.create(data);

        // Emit real-time event
        emitProductCreated(product.toObject());

        // Check for low stock
        if (product.stock <= LOW_STOCK_THRESHOLD) {
            emitLowStockAlert(product.toObject());
        }

        return NextResponse.json(
            { message: 'Product created successfully', product },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
