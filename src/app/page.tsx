import type { Metadata } from 'next';
import Hero from '@/components/layout/Hero';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/products/ProductCard';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Pashion - Modern Urban Fashion | Shop Streetwear Online',
  description:
    'Discover the latest in urban streetwear. Shop hoodies, tees, and accessories that define your style.',
};

export default function Home() {
  return (
    <main className={styles.page}>
      <Hero />

      {/* TRENDING COLLECTIONS */}
      <section className={styles.section}>
        <Container>
          <header className={styles.sectionHeader}>
            <h2>Trending Collections</h2>
            <p>Curated just for you</p>
          </header>

          <div className={styles.collectionsGrid}>
            <div className={styles.collectionCard}>Urban Essentials</div>
            <div className={styles.collectionCard}>Summer Drop</div>
            <div className={styles.collectionCard}>Accessories</div>
          </div>
        </Container>
      </section>

      {/* NEW ARRIVALS */}
      <section className={`${styles.section} ${styles.light}`}>
        <Container>
          <header className={styles.sectionHeader}>
            <h2>New Arrivals</h2>
            <p>Fresh styles just dropped</p>
          </header>

          <div className={styles.productsGrid}>
            <ProductCard product={{
              id: '1',
              name: 'Oversized Street Hoodie',
              price: 89,
              image: '/hoodie.png',
              slug: 'oversized-street-hoodie',
              badge: 'NEW',
            }} />

            <ProductCard product={{
              id: '2',
              name: 'Essential Black Tee',
              price: 35,
              originalPrice: 45,
              image: '/hoodie.png',
              slug: 'essential-black-tee',
              badge: 'SALE',
            }} />

            <ProductCard product={{
              id: '3',
              name: 'Urban Cargo Pants',
              price: 95,
              image: '/hoodie.png',
              slug: 'urban-cargo-pants',
            }} />

            <ProductCard product={{
              id: '4',
              name: 'Tactical Vest',
              price: 120,
              image: '/hoodie.png',
              slug: 'tactical-vest',
            }} />
          </div>
        </Container>
      </section>
    </main>
  );
}
