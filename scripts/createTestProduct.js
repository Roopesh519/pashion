const dbConnect = require('../src/lib/db').default || require('../src/lib/db');
const Product = require('../src/models/Product').default || require('../src/models/Product');

async function run() {
  try {
    await dbConnect();
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
