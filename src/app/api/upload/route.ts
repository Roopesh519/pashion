import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';
import { siteConfig } from '@/config/site.config';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function hasValidImageSignature(buffer: Buffer, type: string) {
    const signatures: Record<string, number[]> = {
        'image/jpeg': [0xff, 0xd8, 0xff],
        'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
        'image/gif': [0x47, 0x49, 0x46, 0x38],
        'image/webp': [0x52, 0x49, 0x46, 0x46],
    };
    const signature = signatures[type];
    if (!signature || !signature.every((byte, index) => buffer[index] === byte)) return false;
    return type !== 'image/webp' || buffer.subarray(8, 12).toString('ascii') === 'WEBP';
}

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
        if (!hasValidImageSignature(buffer, file.type)) {
            return NextResponse.json({ error: 'The selected file is not a valid image' }, { status: 400 });
        }
        const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

        const uploadFolder = process.env.CLOUDINARY_FOLDER || `${siteConfig.name.toLowerCase()}/products`;

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: uploadFolder,
            transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
        });

        return NextResponse.json({ url: result.secure_url }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
    }
}
