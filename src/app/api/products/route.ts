import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { resolveCategoryNames } from '@/lib/category';
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
        const search = searchParams.get('search')?.trim() || '';

        const requestedPage = Number(searchParams.get('page') || 1);
        const requestedLimit = Number(searchParams.get('limit') || 20);

        const page =
            Number.isInteger(requestedPage) && requestedPage > 0
                ? requestedPage
                : 1;

        const limit =
            Number.isInteger(requestedLimit) && requestedLimit > 0
                ? Math.min(requestedLimit, 100)
                : 20;

        const query: Record<string, unknown> = {};

        // Category filter
        if (category) {
            const categoryNames = await resolveCategoryNames([category]);

            if (categoryNames.length > 0) {
                query.category = categoryNames[0];
            } else {
                query.category = category;
            }
        }

        // Featured filter
        if (featured === 'true') {
            query.isFeatured = true;
        }

        // Search
        if (search) {
            query.name = {
                $regex: search,
                $options: 'i',
            };
        }

        const total = await Product.countDocuments(query);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        // Prevent requesting a page beyond the available range
        const validPage = Math.min(page, totalPages);

        const skip = (validPage - 1) * limit;

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json(
            {
                products,
                pagination: {
                    page: validPage,
                    limit,
                    total,
                    totalPages,
                    hasNextPage: validPage < totalPages,
                    hasPreviousPage: validPage > 1,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to fetch products:', error);

        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
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
        if (typeof data.category !== 'string' || !(data.category as string).trim()) {
            return NextResponse.json({ error: 'Category is required' }, { status: 400 });
        }
        if (typeof data.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug as string)) {
            return NextResponse.json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' }, { status: 400 });
        }

        const categoryExists = await Category.findOne({ name: (data.category as string).trim() }).select('_id').lean();
        if (!categoryExists) {
            return NextResponse.json({ error: 'Please select a valid category' }, { status: 400 });
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
