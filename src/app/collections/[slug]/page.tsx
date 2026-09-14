export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import FilterSidebar from '@/components/shop/FilterSidebar';
import SortSelect from '@/components/shop/SortSelect';
import InfiniteProductGrid from '@/components/products/InfiniteProductGrid';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { buildCategoryProductQuery, findCategoryByIdentifier } from '@/lib/category';
import { escapeRegExp } from '@/lib/categoryUtils';
import { siteConfig } from '@/config/site.config';
import styles from './page.module.css';

type CollectionSlugPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

type ListingParams = Record<string, string | string[]>;

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
};

export async function generateMetadata({ params }: CollectionSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const category = await findCategoryByIdentifier(slug);
  const collectionName = category?.name || decodeURIComponent(slug).replace(/-/g, ' ').toUpperCase();
  return {
    title: `${collectionName} Collection - ${siteConfig.name}`,
    description: category?.description || `Explore the ${collectionName} collection at ${siteConfig.name}.`,
  };
}

async function getCollectionProducts(slug: string, categoryName: string | undefined, searchParams?: ListingParams) {
  await dbConnect();
  const categoryQuery = buildCategoryProductQuery(slug, categoryName);
  const filters: Record<string, unknown> = {};

  const minPrice = searchParams?.minPrice ? parseFloat(searchParams.minPrice as string) : 0;
  const maxPrice = searchParams?.maxPrice ? parseFloat(searchParams.maxPrice as string) : Infinity;
  if (minPrice > 0 || maxPrice < Infinity) filters.price = { $gte: minPrice, $lte: maxPrice };

  if (searchParams?.size) {
    const sizes = Array.isArray(searchParams.size) ? searchParams.size : [searchParams.size];
    if (sizes.length > 0 && sizes[0]) filters.sizes = { $in: sizes };
  }

  if (searchParams?.color) {
    const colors = Array.isArray(searchParams.color) ? searchParams.color : [searchParams.color];
    if (colors.length > 0 && colors[0]) filters['colors.name'] = { $in: colors };
  }

  const search = typeof searchParams?.search === 'string' ? searchParams.search.trim() : '';
  if (search) {
    const searchPattern = new RegExp(escapeRegExp(search), 'i');
    filters.$or = [
      { name: searchPattern },
      { description: searchPattern },
      { category: searchPattern },
    ];
  }

  const query = Object.keys(filters).length > 0 ? { $and: [categoryQuery, filters] } : categoryQuery;
  const sortKey = typeof searchParams?.sort === 'string' ? searchParams.sort : 'newest';
  const sort = SORT_MAP[sortKey] ?? SORT_MAP.newest;
  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).limit(10).lean(),
    Product.countDocuments(query),
  ]);
  return { products, total };
}

async function getCollectionFilters(slug: string, categoryName?: string) {
  await dbConnect();
  const query = buildCategoryProductQuery(slug, categoryName);
  const [sizes, colors] = await Promise.all([
    Product.distinct('sizes', query),
    Product.distinct('colors.name', query),
  ]);
  return { sizes: sizes.map(String), colors: colors.map(String) };
}

export default async function CollectionSlugPage({ params, searchParams }: CollectionSlugPageProps) {
  const { slug } = await params;
  const rawSearchParams = await searchParams;
  const normalizedParams: ListingParams = Object.entries(rawSearchParams || {}).reduce((result, [key, value]) => {
    if (value !== undefined && value !== null && value !== '' && key !== 'category') {
      result[key] = value as string | string[];
    }
    return result;
  }, {} as ListingParams);
  await dbConnect();
  const category = await findCategoryByIdentifier(slug);
  const collectionName = category?.name || decodeURIComponent(slug).replace(/-/g, ' ').toUpperCase();

  const [listing, filters, session] = await Promise.all([
    getCollectionProducts(slug, category?.name, normalizedParams),
    getCollectionFilters(slug, category?.name),
    getAuthSession(),
  ]);

  let wishlistedIds = new Set<string>();
  if (session?.user?.id) {
    await dbConnect();
    const u = (await User.findById(session.user.id).select('wishlist').lean()) as any;
    wishlistedIds = new Set((u?.wishlist ?? []).map((id: any) => id.toString()));
  }

  const products = listing.products.map((p: any) => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.images?.[0] || '/brand/placeholder.webp',
    hoverImage: p.images?.[1],
    badge: p.badge || (p.isFeatured ? 'FEATURED' : undefined),
    slug: p.slug,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <div className={styles.breadcrumbs}>
            <Link href="/">Home</Link> / <Link href="/collections">Collections</Link> / <span>{collectionName}</span>
          </div>
          <h1 className={styles.title}>{collectionName} Collection</h1>
          <p className={styles.subtitle}>{category?.description || 'Curated products in this collection'}</p>
        </Container>
      </div>

      <Container className={styles.container}>
        <FilterSidebar
          categories={[]}
          sizes={filters.sizes}
          colors={filters.colors}
          searchParams={normalizedParams}
          showCategories={false}
          basePath={`/collections/${encodeURIComponent(slug)}`}
        />

        <div className={styles.main}>
          <div className={styles.toolbar}>
            <p className={styles.resultCount}>Showing {products.length} of {listing.total} products</p>
            <Suspense fallback={null}>
              <SortSelect current={normalizedParams.sort as string} />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className={styles.empty}>
              <p>No products found in this collection.</p>
              <Link href="/collections" className={styles.backBtn}>View All Collections</Link>
            </div>
          ) : (
            <InfiniteProductGrid
              key={`${slug}-${JSON.stringify(normalizedParams)}`}
              initialProducts={products}
              initialTotal={listing.total}
              query={{ ...normalizedParams, category: slug }}
              wishlistedIds={wishlistedIds}
              gridClassName={styles.grid}
            />
          )}
        </div>
      </Container>
    </div>
  );
}
