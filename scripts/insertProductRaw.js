const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env.local');
  process.exit(1);
}

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: [String],
  category: String,
  slug: { type: String, unique: true },
  stock: Number,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function run() {
  try {
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DBNAME });
    const existing = await Product.findOne({ slug: 'test-product-001' });
    if (existing) {
      console.log('Test product already exists:', existing._id.toString());
      process.exit(0);
    }

    const prod = await Product.create({
      name: 'Test T-Shirt',
      description: 'A simple test t-shirt',
      price: 19.99,
      images: ['/images/test-shirt.jpg'],
      category: 'apparel',
      slug: 'test-product-001',
      stock: 100
    });

    console.log('Created test product with id:', prod._id.toString());
    process.exit(0);
  } catch (err) {
    console.error('Failed to create test product:', err);
    process.exit(1);
  }
}

run();
