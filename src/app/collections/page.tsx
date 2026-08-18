export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { siteConfig } from '@/config/site.config';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: `Collections - ${siteConfig.name}`,
  description: `Browse all collections at ${siteConfig.name}.`,
};

async function getCollections() {
  await dbConnect();
  const categories: string[] = await Product.distinct('category');
  const counts = await Promise.all(
    categories.map(async (cat) => ({
      name: cat,
      count: await Product.countDocuments({ category: cat }),
    }))
  );
  return counts;
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <h1 className={styles.title}>Collections</h1>
          <p className={styles.subtitle}>Browse by category</p>
        </Container>
      </div>

      <Container>
        {collections.length === 0 ? (
          <p className={styles.empty}>No collections available yet.</p>
        ) : (
          <div className={styles.grid}>
            {collections.map((col) => (
              <Link
                key={col.name}
                href={`/shop?category=${encodeURIComponent(col.name)}`}
                className={styles.card}
              >
                <span className={styles.name}>{col.name}</span>
                <span className={styles.count}>{col.count} products</span>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
