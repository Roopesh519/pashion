export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import Container from '@/components/ui/Container';
import FilterSidebar from '@/components/shop/FilterSidebar';
import SortSelect from '@/components/shop/SortSelect';
import ProductCard from '@/components/products/ProductCard';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { resolveCategoryNames } from '@/lib/category';
import styles from './page.module.css';

import { siteConfig } from '@/config/site.config';

export const metadata: Metadata = {
    title: `Shop All Products - ${siteConfig.name}`,
    description: `Browse our complete collection. Filter by category, size, and price to find your perfect style.`,
};

type ShopPageProps = {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
    'newest':     { createdAt: -1 },
    'price-asc':  { price: 1 },
    'price-desc': { price: -1 },
};

async function getFilteredProducts(searchParams?: Record<string, string | string[]>) {
    await dbConnect();

    const query: any = {};

    if (searchParams?.category) {
        const categories = Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category];
        const categoryNames = await resolveCategoryNames(categories);
        if (categoryNames.length > 0) query.category = { $in: categoryNames };
    }

    const minPrice = searchParams?.minPrice ? parseFloat(searchParams.minPrice as string) : 0;
    const maxPrice = searchParams?.maxPrice ? parseFloat(searchParams.maxPrice as string) : Infinity;
    if (minPrice > 0 || maxPrice < Infinity) query.price = { $gte: minPrice, $lte: maxPrice };

    if (searchParams?.size) {
        const sizes = Array.isArray(searchParams.size) ? searchParams.size : [searchParams.size];
        if (sizes.length > 0 && sizes[0]) query.sizes = { $in: sizes };
    }

    if (searchParams?.color) {
        const colors = Array.isArray(searchParams.color) ? searchParams.color : [searchParams.color];
        if (colors.length > 0 && colors[0]) query['colors.name'] = { $in: colors };
    }

    const sortKey = typeof searchParams?.sort === 'string' ? searchParams.sort : 'newest';
    const sort = SORT_MAP[sortKey] ?? SORT_MAP['newest'];

    return Product.find(query).sort(sort).limit(100).lean();
}

async function getDistinctFilters() {
    await dbConnect();
    const [categories, categoryCounts] = await Promise.all([
        Category.find({}).sort({ sortOrder: 1, name: 1 }).lean(),
        Product.aggregate<{ _id: string; count: number }>([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]),
    ]);
    const sizes = await Product.distinct('sizes');
    const colors = await Product.distinct('colors.name');
    const countMap = new Map(categoryCounts.map((entry) => [entry._id, entry.count]));
    
    return { 
        categories: (categories || [])
            .map((category: any) => ({
                id: category._id.toString(),
                name: String(category.name),
                slug: String(category.slug),
                productCount: countMap.get(String(category.name)) || 0,
            }))
            .filter((category) => category.productCount > 0)
            .map(({ productCount, ...category }) => category),
        sizes: (sizes || []).map(s => String(s)), 
        colors: (colors || []).map(c => String(c)) 
    };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const params = await searchParams;

    // Normalize searchParams: remove keys with undefined values so the
    // shape matches `Record<string, string | string[]> | undefined`.
    const normalizedParams: Record<string, string | string[]> | undefined = params
        ? Object.entries(params).reduce((acc, [k, v]) => {
              if (v === undefined || v === null || v === '') return acc;
              acc[k] = v as string | string[];
              return acc;
          }, {} as Record<string, string | string[]>)
        : undefined;

    const [dbProducts, filters, session] = await Promise.all([
        getFilteredProducts(normalizedParams),
        getDistinctFilters(),
        getAuthSession(),
    ]);

    let wishlistedIds = new Set<string>();
    if (session?.user?.id) {
        await dbConnect();
        const u = await User.findById(session.user.id).select('wishlist').lean() as any;
        wishlistedIds = new Set((u?.wishlist ?? []).map((id: any) => id.toString()));
    }
    
    // Transform to match ProductCard interface
    const products = dbProducts.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        image: p.images?.[0] || '/brand/placeholder.webp',
        slug: p.slug,
        badge: p.badge || (p.isFeatured ? 'FEATURED' : undefined),
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
                <FilterSidebar categories={filters.categories} sizes={filters.sizes} colors={filters.colors} searchParams={normalizedParams} />

                <div className={styles.main}>
                    <div className={styles.toolbar}>
                        <p className={styles.resultCount}>Showing {products.length} products</p>
                        <Suspense fallback={null}>
                            <SortSelect current={normalizedParams?.sort as string} />
                        </Suspense>
                    </div>

                    {products.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No products available yet. Check back soon!</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} wishlistedIds={wishlistedIds} />
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
