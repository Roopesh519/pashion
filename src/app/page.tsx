export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/layout/Hero';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/products/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Pashion - Modern Urban Fashion | Shop Streetwear Online',
  description:
    'Discover the latest in urban streetwear. Shop hoodies, tees, and accessories that define your style.',
};

async function getNewArrivals() {
  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(4).lean();
  return products as any[];
}

async function getCategories() {
  await dbConnect();
  const categories = await Product.distinct('category');
  return categories as string[];
}

export default async function Home() {
  const [products, categories, session] = await Promise.all([getNewArrivals(), getCategories(), getAuthSession()]);

  let wishlistedIds = new Set<string>();
  if (session?.user?.id) {
    await dbConnect();
    const u = await User.findById(session.user.id).select('wishlist').lean() as any;
    wishlistedIds = new Set((u?.wishlist ?? []).map((id: any) => id.toString()));
  }

  return (
    <main className={styles.page}>
      <Hero />

      {/* TRENDING COLLECTIONS */}
      {categories.length > 0 && (
        <section className={styles.section}>
          <Container>
            <header className={styles.sectionHeader}>
              <h2>Trending Collections</h2>
              <p>Curated just for you</p>
            </header>
            <div className={styles.collectionsGrid}>
              {categories.map((cat) => (
                <Link key={cat} href={`/shop?category=${encodeURIComponent(cat)}`} className={styles.collectionCard}>
                  {cat}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {products.length > 0 && (
        <section className={`${styles.section} ${styles.light}`}>
          <Container>
            <header className={styles.sectionHeader}>
              <h2>New Arrivals</h2>
              <p>Fresh styles just dropped</p>
            </header>
            <div className={styles.productsGrid}>
              {products.map((p) => (
                <ProductCard
                  key={p._id.toString()}
                  product={{
                    id: p._id.toString(),
                    name: p.name,
                    price: p.price,
                    originalPrice: p.originalPrice,
                    image: p.images?.[0] || '/hoodie.png',
                    hoverImage: p.images?.[1],
                    badge: p.badge || undefined,
                    slug: p.slug,
                  }}
                  wishlistedIds={wishlistedIds}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
