const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    images: [String],
    category: String,
    slug: String,
    sizes: { type: [String], default: ['S', 'M', 'L', 'XL'] },
    colors: [{ name: String, value: String }],
    stock: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', ProductSchema);

const testProducts = [
    {
        name: 'Classic Black Hoodie',
        description: 'A timeless black hoodie perfect for any season',
        price: 49.99,
        images: ['data:image/svg+xml,%3Csvg%3E%3C/svg%3E'],
        category: 'Hoodies',
        slug: 'classic-black-hoodie',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Black', value: '#000000' }],
        stock: 50,
        isFeatured: true,
    },
    {
        name: 'Red Crew Neck',
        description: 'Comfortable crew neck in vibrant red',
        price: 39.99,
        images: ['data:image/svg+xml,%3Csvg%3E%3C/svg%3E'],
        category: 'T-Shirts',
        slug: 'red-crew-neck',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Red', value: '#ff0000' }],
        stock: 30,
    },
    {
        name: 'Blue Oversized Tee',
        description: 'Oversized blue t-shirt for that relaxed fit',
        price: 34.99,
        images: ['data:image/svg+xml,%3Csvg%3E%3C/svg%3E'],
        category: 'T-Shirts',
        slug: 'blue-oversized-tee',
        sizes: ['M', 'L', 'XL'],
        colors: [{ name: 'Blue', value: '#0000ff' }],
        stock: 40,
    },
    {
        name: 'Premium Black Pants',
        description: 'Sleek black pants with modern fit',
        price: 79.99,
        images: ['data:image/svg+xml,%3Csvg%3E%3C/svg%3E'],
        category: 'Pants',
        slug: 'premium-black-pants',
        sizes: ['28', '30', '32', '34', '36'],
        colors: [{ name: 'Black', value: '#000000' }],
        stock: 25,
    },
    {
        name: 'Gray Joggers',
        description: 'Comfortable gray joggers for everyday wear',
        price: 59.99,
        images: ['data:image/svg+xml,%3Csvg%3E%3C/svg%3E'],
        category: 'Pants',
        slug: 'gray-joggers',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Gray', value: '#808080' }],
        stock: 35,
    },
    {
        name: 'White Casual Tee',
        description: 'Simple white t-shirt for casual style',
        price: 29.99,
        images: ['data:image/svg+xml,%3Csvg%3E%3C/svg%3E'],
        category: 'T-Shirts',
        slug: 'white-casual-tee',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [{ name: 'White', value: '#ffffff' }],
        stock: 60,
    },
    {
        name: 'Navy Windbreaker',
        description: 'Lightweight windbreaker for all seasons',
        price: 69.99,
        images: ['data:image/svg+xml,%3Csvg%3E%3C/svg%3E'],
        category: 'Outerwear',
        slug: 'navy-windbreaker',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Blue', value: '#0000ff' }],
        stock: 20,
    },
    {
        name: 'Premium Leather Belt',
        description: 'Genuine leather belt for a polished look',
        price: 44.99,
        images: ['data:image/svg+xml,%3Csvg%3E%3C/svg%3E'],
        category: 'Accessories',
        slug: 'premium-leather-belt',
        sizes: ['One Size'],
        colors: [{ name: 'Black', value: '#000000' }],
        stock: 100,
    },
];

async function seedProducts() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('MONGODB_URI not set in .env.local');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert test products
        const created = await Product.insertMany(testProducts);
        console.log(`Created ${created.length} test products`);

        // Display created products
        const allProducts = await Product.find().select('name category price sizes colors stock');
        console.log('\nCreated Products:');
        console.table(allProducts.map((p) => ({
            name: p.name,
            category: p.category,
            price: p.price,
            sizes: p.sizes.join(', '),
            colors: p.colors.map((c) => c.name).join(', '),
            stock: p.stock,
        })));

        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();
