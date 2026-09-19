import { NextResponse } from 'next/server';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';
import dbConnect from '@/lib/db';
import HomeBanner from '@/models/HomeBanner';

const MAX_URL_LENGTH = 2048;

function isValidImageUrl(value: unknown): value is string {
    if (typeof value !== 'string' || !value.trim() || value.length > MAX_URL_LENGTH) return false;

    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
}

export async function GET() {
    const admin = await requireAdmin();
    if (!admin) return forbiddenResponse('Admin access required');

    await dbConnect();
    const banner = await HomeBanner.findOne().lean();
    return NextResponse.json({ banner: banner || null });
}

export async function PUT(request: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) return forbiddenResponse('Admin access required');

        const { desktopImage, mobileImage } = await request.json();
        if (!isValidImageUrl(desktopImage) || !isValidImageUrl(mobileImage)) {
            return NextResponse.json(
                { error: 'A valid desktop and mobile banner image are required.' },
                { status: 400 }
            );
        }

        await dbConnect();
        const existing = await HomeBanner.findOne().sort({ createdAt: 1 });
        const banner = existing
            ? await HomeBanner.findByIdAndUpdate(
                existing._id,
                { desktopImage: desktopImage.trim(), mobileImage: mobileImage.trim() },
                { new: true, runValidators: true }
            )
            : await HomeBanner.create({ desktopImage: desktopImage.trim(), mobileImage: mobileImage.trim() });

        return NextResponse.json({ banner });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to save banner' }, { status: 500 });
    }
}
