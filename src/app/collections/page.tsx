export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { siteConfig } from '@/config/site.config';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: `Collections - ${siteConfig.name}`,
  description: `Browse all collections at ${siteConfig.name}.`,
};

async function getCollections() {
  await dbConnect();
  const [categories, counts] = await Promise.all([
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

  const countMap = new Map(counts.map((entry) => [entry._id, entry.count]));

  return categories
    .map((category: any) => ({
      name: String(category.name),
      slug: String(category.slug),
      image: String(category.image),
      count: countMap.get(String(category.name)) || 0,
    }))
    .filter((category) => category.count > 0);
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
                href={`/collections/${encodeURIComponent(col.slug)}`}
                className={styles.card}
              >
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={col.image} alt={col.name} className={styles.image} />
                  <div className={styles.gradient}></div>
                </div>
                <div className={styles.content}>
                  <div>
                    <h3 className={styles.name}>{col.name}</h3>
                    <p className={styles.tagline}>{col.count} products</p>
                  </div>
                  <div className={styles.arrow}>
                    <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
