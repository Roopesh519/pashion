/**
 * Migration: base64 product images → Cloudinary URLs
 *
 * Usage:
 *   node scripts/migrateImages.js
 *
 * Requires CLOUDINARY_* and MONGODB_URI in .env.local
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ProductSchema = new mongoose.Schema({ name: String, images: [String] }, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

function isBase64Image(str) {
    return typeof str === 'string' && str.startsWith('data:image/');
}

async function uploadBase64(dataUri, productName, index) {
    const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'pashion/products',
        public_id: `${productName.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
    });
    return result.secure_url;
}

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
        const images = product.images || [];
        const hasBase64 = images.some(isBase64Image);

        if (!hasBase64) {
            skipped++;
            continue;
        }

        console.log(`\nMigrating: ${product.name} (${images.length} images)`);
        const newImages = [];

        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            if (isBase64Image(img)) {
                try {
                    const url = await uploadBase64(img, product.name, i);
                    newImages.push(url);
                    console.log(`  ✓ Image ${i + 1} → ${url}`);
                } catch (err) {
                    console.error(`  ✗ Image ${i + 1} failed:`, err.message);
                    newImages.push(img); // keep original on failure
                    errors++;
                }
            } else {
                newImages.push(img); // already a URL, keep as-is
            }
        }

        await Product.updateOne({ _id: product._id }, { $set: { images: newImages } });
        migrated++;
    }

    console.log(`\n--- Migration complete ---`);
    console.log(`Migrated: ${migrated} products`);
    console.log(`Skipped (no base64): ${skipped} products`);
    console.log(`Upload errors: ${errors}`);

    await mongoose.disconnect();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
