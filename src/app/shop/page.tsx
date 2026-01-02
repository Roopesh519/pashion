import type { Metadata } from 'next';
import React from 'react';
import Container from '@/components/ui/Container';
import FilterSidebar from '@/components/shop/FilterSidebar';
import ProductCard from '@/components/products/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Shop All Products - Pashion',
    description: 'Browse our complete collection of urban streetwear. Filter by category, size, and price to find your perfect style.',
};

async function getProducts() {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(50).lean();
    return products;
}

export default async function ShopPage() {
    const dbProducts = await getProducts();
    
    // Transform to match ProductCard interface
    const products = dbProducts.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        image: p.images?.[0] || '/hoodie.png',
        slug: p.slug,
        badge: p.isFeatured ? 'FEATURED' : undefined,
    }));

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Container>
                    <h1 className={styles.title}>Shop All</h1>
                    <p className={styles.subtitle}>Discover the latest in urban fashion</p>
                </Container>
            </div>

            <Container className={styles.container}>
                <FilterSidebar />

                <div className={styles.main}>
                    <div className={styles.toolbar}>
                        <p className={styles.resultCount}>Showing {products.length} products</p>
                        <select className={styles.sortSelect}>
                            <option value="newest">Sort by: Newest</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="bestselling">Bestselling</option>
                        </select>
                    </div>

                    {products.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No products available yet. Check back soon!</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
