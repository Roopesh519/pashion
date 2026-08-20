export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

function getCategoryImage(category: string) {
  switch (category.toLowerCase()) {
    case 'hoodies':
    case 'hoodie':
      return '/brand/hoodie.png';
    case 'pants':
      return '/brand/pant.png';
    case 't-shirts':
    case 't-shirt':
      return '/brand/tshirt.png';
    default:
      return '/brand/hero.webp';
  }
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
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getCategoryImage(col.name)} alt={col.name} className={styles.image} />
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
