import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAuth, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';

interface RouteParams {
    params: Promise<{ id: string }>;
}

function canAccess(user: any, paramsId: string) {
    return user.role === 'admin' || user.id === paramsId;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await requireAuth();
        if (!user) return unauthorizedResponse('Please sign in');
        if (!canAccess(user, id)) return forbiddenResponse('You can only access your own wishlist');

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const offsetParam = searchParams.get('offset');
        const limitParam = searchParams.get('limit');
        const offsetValue = offsetParam === null ? 0 : Number(offsetParam);
        const limitValue = limitParam === null ? 10 : Number(limitParam);
        const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0;
        const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 10;

        const [found] = await User.aggregate<{ wishlist: mongoose.Types.ObjectId[]; total: number }>([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            { $project: { total: { $size: '$wishlist' }, wishlist: { $slice: ['$wishlist', offset, limit] } } },
        ]);
        const wishlistIds = found?.wishlist || [];
        const products = await Product.find({ _id: { $in: wishlistIds } })
            .select('name price images slug')
            .lean();
        const productsById = new Map(products.map((product: any) => [product._id.toString(), product]));
        const wishlist = wishlistIds
            .map((productId) => productsById.get(productId.toString()))
            .filter(Boolean);
        const total = found?.total || 0;

        return NextResponse.json({
            wishlist,
            pagination: { offset, limit, total, hasMore: offset + wishlist.length < total, nextOffset: offset + wishlist.length },
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await requireAuth();
        if (!user) return unauthorizedResponse('Please sign in');
        if (!canAccess(user, id)) return forbiddenResponse();

        await dbConnect();
        const { productId } = await request.json();

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json({ error: 'Valid product ID is required' }, { status: 400 });
        }
        if (!await Product.exists({ _id: productId })) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const updated = await User.findByIdAndUpdate(
            id,
            { $addToSet: { wishlist: new mongoose.Types.ObjectId(productId) } },
            { new: true }
        ).populate('wishlist', 'name price images slug');

        return NextResponse.json({ message: 'Added to wishlist', wishlist: updated?.wishlist }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await requireAuth();
        if (!user) return unauthorizedResponse();
        if (!canAccess(user, id)) return forbiddenResponse();

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json({ error: 'Valid product ID is required' }, { status: 400 });
        }

        const updated = await User.findByIdAndUpdate(
            id,
            { $pull: { wishlist: new mongoose.Types.ObjectId(productId) } },
            { new: true }
        ).populate('wishlist', 'name price images slug');

        return NextResponse.json({ message: 'Removed from wishlist', wishlist: updated?.wishlist }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }
}
