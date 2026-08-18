export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/products/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { siteConfig } from '@/config/site.config';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: `Sale - ${siteConfig.name}`,
  description: `Shop discounted products at ${siteConfig.name}.`,
};

async function getSaleProducts() {
  await dbConnect();
  return Product.find({ originalPrice: { $exists: true, $gt: 0 } })
    .sort({ createdAt: -1 })
    .lean() as Promise<any[]>;
}

export default async function SalePage() {
  const [products, session] = await Promise.all([getSaleProducts(), getAuthSession()]);

  let wishlistedIds = new Set<string>();
  if (session?.user?.id) {
    await dbConnect();
    const u = await User.findById(session.user.id).select('wishlist').lean() as any;
    wishlistedIds = new Set((u?.wishlist ?? []).map((id: any) => id.toString()));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <h1 className={styles.title}>Sale</h1>
          <p className={styles.subtitle}>Limited time offers — while stocks last</p>
        </Container>
      </div>

      <Container>
        {products.length === 0 ? (
          <p className={styles.empty}>No sale items at the moment. Check back soon!</p>
        ) : (
          <div className={styles.grid}>
            {products.map((p) => (
              <ProductCard
                key={p._id.toString()}
                product={{
                  id: p._id.toString(),
                  name: p.name,
                  price: p.price,
                  originalPrice: p.originalPrice,
                  image: p.images?.[0] || '/brand/placeholder.webp',
                  hoverImage: p.images?.[1],
                  badge: p.badge || 'SALE',
                  slug: p.slug,
                }}
                wishlistedIds={wishlistedIds}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
