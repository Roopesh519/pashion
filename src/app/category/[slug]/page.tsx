export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/products/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { siteConfig } from '@/config/site.config';
import { categoryConfig } from '@/config/category.config';
import styles from './page.module.css';

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug);
  const matchedCategory = categoryConfig.find(
    (c) => c.slug.toLowerCase() === normalizedSlug.toLowerCase() || c.name.toLowerCase() === normalizedSlug.toLowerCase()
  );
  const title = matchedCategory ? `${matchedCategory.name} - ${siteConfig.name}` : `${normalizedSlug} - ${siteConfig.name}`;

  return {
    title,
    description: matchedCategory?.description || `Explore ${normalizedSlug} products at ${siteConfig.name}.`,
  };
}

async function getCategoryProducts(slug: string) {
  await dbConnect();
  const normalized = decodeURIComponent(slug);
  
  // Find products where category matches slug or category regex
  const regex = new RegExp(`^${normalized.replace(/-/g, ' ')}$`, 'i');
  const products = await Product.find({
    $or: [{ category: regex }, { category: new RegExp(`^${normalized}$`, 'i') }],
  })
    .sort({ createdAt: -1 })
    .lean();

  // If no direct regex match, fallback to substring match
  if (products.length === 0) {
    return Product.find({ category: new RegExp(normalized, 'i') }).sort({ createdAt: -1 }).lean();
  }

  return products;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug);
  const matchedCategory = categoryConfig.find(
    (c) => c.slug.toLowerCase() === normalizedSlug.toLowerCase() || c.name.toLowerCase() === normalizedSlug.toLowerCase()
  );
  const categoryName = matchedCategory ? matchedCategory.name : normalizedSlug.replace(/-/g, ' ').toUpperCase();

  const [dbProducts, session] = await Promise.all([
    getCategoryProducts(slug),
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
            <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <span>{categoryName}</span>
          </div>
          <h1 className={styles.title}>{categoryName}</h1>
          {matchedCategory?.description && <p className={styles.subtitle}>{matchedCategory.description}</p>}
        </Container>
      </div>

      <Container>
        {products.length === 0 ? (
          <div className={styles.empty}>
            <p>No products found in this category.</p>
            <Link href="/shop" className={styles.backBtn}>Browse All Products</Link>
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
