import { NextResponse } from 'next/server';
import { requireAuth, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

interface RouteParams {
    params: {
        id: string;
    };
}

/**
 * GET /api/user/[id]/wishlist - Get user's wishlist
 */
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await requireAuth();
        if (!user) {
            return unauthorizedResponse('Please sign in');
        }

        if ((user as any).id !== params.id && (user as any).role !== 'admin') {
            return forbiddenResponse('You can only access your own wishlist');
        }

        await dbConnect();

        const userWithWishlist = await User.findById(params.id)
            .populate('wishlist', 'name price images slug')
            .select('wishlist');

        return NextResponse.json(
            { wishlist: userWithWishlist?.wishlist || [] },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wishlist' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/user/[id]/wishlist - Add item to wishlist
 */
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const user = await requireAuth();
        if (!user) {
            return unauthorizedResponse('Please sign in');
        }

        if ((user as any).id !== params.id && (user as any).role !== 'admin') {
            return forbiddenResponse();
        }

        await dbConnect();
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            params.id,
            { $addToSet: { wishlist: productId } },
            { new: true }
        ).populate('wishlist', 'name price images slug');

        return NextResponse.json(
            { message: 'Added to wishlist', wishlist: updatedUser?.wishlist },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to add to wishlist' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/user/[id]/wishlist/[productId] - Remove from wishlist
 */
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const user = await requireAuth();
        if (!user) {
            return unauthorizedResponse();
        }

        if ((user as any).id !== params.id && (user as any).role !== 'admin') {
            return forbiddenResponse();
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            params.id,
            { $pull: { wishlist: productId } },
            { new: true }
        ).populate('wishlist', 'name price images slug');

        return NextResponse.json(
            { message: 'Removed from wishlist', wishlist: updatedUser?.wishlist },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to remove from wishlist' },
            { status: 500 }
        );
    }
}
