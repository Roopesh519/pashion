import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) return forbiddenResponse('Admin access required');

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Only JPEG, PNG, WebP and GIF images are allowed' }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'pashion/products',
            transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
        });

        return NextResponse.json({ url: result.secure_url }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
    }
}
