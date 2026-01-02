import { NextResponse } from 'next/server';
import { requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { emitProductCreated, emitLowStockAlert } from '@/lib/socketEvents';
import { LOW_STOCK_THRESHOLD } from '@/lib/socketConfig';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');

        let query: any = {};
        if (category) query.category = category;
        if (featured === 'true') query.isFeatured = true;

        const products = await Product.find(query).limit(50).lean();
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
        const data = await request.json();

        // Validation
        if (!data.name || !data.price || !data.images || !data.category || !data.slug) {
            return NextResponse.json(
                { error: 'Missing required fields: name, price, images, category, slug' },
                { status: 400 }
            );
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
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to create product' },
            { status: 500 }
        );
    }
}
