import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { slugifyCategoryName } from '@/lib/category';

interface RouteParams {
    params: Promise<{ id: string }>;
}

function normalizeCategoryPayload(data: unknown) {
    if (!data || typeof data !== 'object') return null;

    const input = data as Record<string, unknown>;

    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const slugInput = typeof input.slug === 'string' ? input.slug.trim() : '';
    const description = typeof input.description === 'string' ? input.description.trim() : '';
    const image = typeof input.image === 'string' ? input.image.trim() : '';
    const featured = Boolean(input.featured);
    const sortOrder = typeof input.sortOrder === 'number' && Number.isFinite(input.sortOrder)
        ? input.sortOrder
        : parseInt(String(input.sortOrder ?? '0'), 10) || 0;

    return {
        name,
        slug: slugifyCategoryName(slugInput || name),
        description,
        image,
        featured,
        sortOrder,
    };
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        await dbConnect();
        const category = await Category.findById(id).lean();

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ category }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const admin = await requireAdmin();
        if (!admin) {
            return forbiddenResponse('Admin access required');
        }

        await dbConnect();

        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const payload = normalizeCategoryPayload(await request.json());
        if (!payload || !payload.name || !payload.slug || !payload.description || !payload.image) {
            return NextResponse.json(
                { error: 'Missing required fields: name, slug, description, image' },
                { status: 400 }
            );
        }

        const duplicate = await Category.findOne({
            _id: { $ne: id },
            $or: [{ name: payload.name }, { slug: payload.slug }],
        });

        if (duplicate) {
            return NextResponse.json(
                { error: 'Another category already uses this name or slug' },
                { status: 409 }
            );
        }

        const previousName = existingCategory.name;
        existingCategory.name = payload.name;
        existingCategory.slug = payload.slug;
        existingCategory.description = payload.description;
        existingCategory.image = payload.image;
        existingCategory.featured = payload.featured;
        existingCategory.sortOrder = payload.sortOrder;
        await existingCategory.save();

        if (previousName !== payload.name) {
            await Product.updateMany({ category: previousName }, { $set: { category: payload.name } });
        }

        return NextResponse.json({ message: 'Category updated successfully', category: existingCategory }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const admin = await requireAdmin();
        if (!admin) {
            return forbiddenResponse('Admin access required');
        }

        await dbConnect();

        const category = await Category.findById(id);
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const linkedProducts = await Product.countDocuments({ category: category.name });
        if (linkedProducts > 0) {
            return NextResponse.json(
                { error: `Cannot delete category while ${linkedProducts} product(s) still use it` },
                { status: 409 }
            );
        }

        await category.deleteOne();

        return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
