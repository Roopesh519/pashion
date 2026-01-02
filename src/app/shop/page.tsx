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

type ShopPageProps = {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getFilteredProducts(searchParams?: Record<string, string | string[]>) {
    await dbConnect();

    const query: any = {};

    // Category filter
    if (searchParams?.category) {
        const categories = Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category];
        if (categories.length > 0 && categories[0]) {
            query.category = { $in: categories };
        }
    }

    // Price filter
    const minPrice = searchParams?.minPrice ? parseFloat(searchParams.minPrice as string) : 0;
    const maxPrice = searchParams?.maxPrice ? parseFloat(searchParams.maxPrice as string) : Infinity;
    if (minPrice > 0 || maxPrice < Infinity) {
        query.price = { $gte: minPrice, $lte: maxPrice };
    }

    // Size filter
    if (searchParams?.size) {
        const sizes = Array.isArray(searchParams.size) ? searchParams.size : [searchParams.size];
        if (sizes.length > 0 && sizes[0]) {
            query.sizes = { $in: sizes };
        }
    }

    // Color filter
    if (searchParams?.color) {
        const colors = Array.isArray(searchParams.color) ? searchParams.color : [searchParams.color];
        if (colors.length > 0 && colors[0]) {
            query['colors.name'] = { $in: colors };
        }
    }

    console.log('Shop filter query:', query);
    const products = await Product.find(query).sort({ createdAt: -1 }).limit(100).lean();
    console.log('Filtered products count:', products.length);
    return products;
}

async function getDistinctFilters() {
    await dbConnect();
    const categories = await Product.distinct('category');
    const sizes = await Product.distinct('sizes');
    const colors = await Product.distinct('colors.name');
    
    // Convert to plain objects (remove Mongoose ObjectId serialization)
    return { 
        categories: (categories || []).map(c => String(c)), 
        sizes: (sizes || []).map(s => String(s)), 
        colors: (colors || []).map(c => String(c)) 
    };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const params = await searchParams;
    const dbProducts = await getFilteredProducts(params);
    const filters = await getDistinctFilters();
    
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
                <FilterSidebar categories={filters.categories} sizes={filters.sizes} colors={filters.colors} searchParams={params} />

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
