import { NextResponse } from 'next/server';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { slugifyCategoryName } from '@/lib/category';

function normalizeCategoryPayload(data: unknown) {
    if (!data || typeof data !== 'object') return null;

    const input = data as Record<string, unknown>;

    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const slugInput = typeof input.slug === 'string' ? input.slug.trim() : '';
    const slug = slugifyCategoryName(slugInput || name);
    const description = typeof input.description === 'string' ? input.description.trim() : '';
    const image = typeof input.image === 'string' ? input.image.trim() : '';
    const featured = Boolean(input.featured);
    const sortOrder = typeof input.sortOrder === 'number' && Number.isFinite(input.sortOrder)
        ? input.sortOrder
        : parseInt(String(input.sortOrder ?? '0'), 10) || 0;

    return { name, slug, description, image, featured, sortOrder };
}

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const featuredOnly = searchParams.get('featured') === 'true';
        const includeCounts = searchParams.get('includeCounts') === 'true';

        const query = featuredOnly ? { featured: true } : {};
        const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 }).lean();

        if (!includeCounts) {
            return NextResponse.json({ categories }, { status: 200 });
        }

        const counts = await Product.aggregate<{ _id: string; count: number }>([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);

        const countMap = new Map(counts.map((entry) => [entry._id, entry.count]));

        const payload = categories.map((category: any) => ({
            ...category,
            productCount: countMap.get(category.name) || 0,
        }));

        return NextResponse.json({ categories: payload }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return forbiddenResponse('Admin access required to create categories');
        }

        await dbConnect();
        const payload = normalizeCategoryPayload(await request.json());

        if (!payload || !payload.name || !payload.slug || !payload.description || !payload.image) {
            return NextResponse.json(
                { error: 'Missing required fields: name, slug, description, image' },
                { status: 400 }
            );
        }

        const existing = await Category.findOne({
            $or: [{ name: payload.name }, { slug: payload.slug }],
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Category with this name or slug already exists' },
                { status: 409 }
            );
        }

        const category = await Category.create(payload);

        return NextResponse.json({ message: 'Category created successfully', category }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
