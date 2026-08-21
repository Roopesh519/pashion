export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/products/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { buildCategoryProductQuery, findCategoryByIdentifier } from '@/lib/category';
import { siteConfig } from '@/config/site.config';
import styles from './page.module.css';

type CollectionSlugPageProps = {
  params: Promise<{ slug: string }>;
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

async function getCollectionProducts(slug: string) {
  await dbConnect();
  const category = await findCategoryByIdentifier(slug);
  return Product.find(buildCategoryProductQuery(slug, category?.name)).sort({ createdAt: -1 }).lean();
}

export default async function CollectionSlugPage({ params }: CollectionSlugPageProps) {
  const { slug } = await params;
  await dbConnect();
  const category = await findCategoryByIdentifier(slug);
  const collectionName = category?.name || decodeURIComponent(slug).replace(/-/g, ' ').toUpperCase();

  const [dbProducts, session] = await Promise.all([
    getCollectionProducts(slug),
    getAuthSession(),
  ]);

  let wishlistedIds = new Set<string>();
  if (session?.user?.id) {
    await dbConnect();
    const u = (await User.findById(session.user.id).select('wishlist').lean()) as any;
    wishlistedIds = new Set((u?.wishlist ?? []).map((id: any) => id.toString()));
  }

  const products = dbProducts.map((p: any) => ({
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

      <Container>
        {products.length === 0 ? (
          <div className={styles.empty}>
            <p>No products found in this collection.</p>
            <Link href="/collections" className={styles.backBtn}>View All Collections</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} wishlistedIds={wishlistedIds} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
