export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/layout/Hero';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/products/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { siteConfig } from '@/config/site.config';
import { homepageConfig } from '@/config/homepage.config';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: `${siteConfig.name} - ${siteConfig.tagline} | Shop Online`,
  description: siteConfig.longDescription,
};

async function getNewArrivals(limit: number) {
  await dbConnect();
  return Product.find({}).sort({ createdAt: -1 }).limit(limit).lean() as Promise<any[]>;
}

async function getFeaturedProducts(limit: number) {
  await dbConnect();
  return Product.find({ isFeatured: true }).limit(limit).lean() as Promise<any[]>;
}

async function getCategories() {
  await dbConnect();
  return Product.distinct('category') as Promise<string[]>;
}

export default async function Home() {
  const session = await getAuthSession();

  let wishlistedIds = new Set<string>();
  if (session?.user?.id) {
    await dbConnect();
    const u = await User.findById(session.user.id).select('wishlist').lean() as any;
    wishlistedIds = new Set((u?.wishlist ?? []).map((id: any) => id.toString()));
  }

  const enabledSections = homepageConfig.filter((s) => s.enabled);

  // Pre-fetch data needed by enabled sections
  const needsNewArrivals = enabledSections.find((s) => s.type === 'newArrivals');
  const needsFeatured = enabledSections.find((s) => s.type === 'featuredProducts');
  const needsCategories = enabledSections.find(
    (s) => s.type === 'featuredCategories'
  );

  const [newArrivals, featuredProducts, categories] = await Promise.all([
    needsNewArrivals
      ? getNewArrivals((needsNewArrivals as any).limit ?? 4)
      : Promise.resolve([]),
    needsFeatured
      ? getFeaturedProducts((needsFeatured as any).limit ?? 4)
      : Promise.resolve([]),
    needsCategories ? getCategories() : Promise.resolve([]),
  ]);

  function toCardProps(p: any) {
    return {
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.images?.[0] || '/brand/placeholder.webp',
      hoverImage: p.images?.[1],
      badge: p.badge || undefined,
      slug: p.slug,
    };
  }

  return (
    <main className={styles.page}>
      {enabledSections.map((section) => {
        switch (section.type) {
          case 'hero':
            return (
              <Hero
                key="hero"
                title={section.title}
                subtitle={section.subtitle}
                image={section.image}
                primaryButton={section.primaryButton}
                secondaryButton={section.secondaryButton}
              />
            );

          case 'featuredCategories':
            return (
              <section key="featuredCategories" className={styles.section}>
                <Container>
                  <header className={styles.sectionHeader}>
                    <span className={styles.sectionHeaderExplore}>Explore</span>
                    <h2>{section.title}</h2>
                    <p>{section.subtitle}</p>
                  </header>
                  <div className={styles.trendingGrid}>
                    {[
                      { title: 'Hoodie', tagline: 'Effortless comfort', image: '/brand/hoodie.png', category: 'Hoodie' },
                      { title: 'Pants', tagline: 'Everyday versatility', image: '/brand/pant.png', category: 'Pants' },
                      { title: 'T-Shirt', tagline: 'Timeless essentials', image: '/brand/tshirt.png', category: 'T-Shirt' }
                    ].map((item) => (
                      <Link
                        key={item.title}
                        href={`/shop?category=${encodeURIComponent(item.category)}`}
                        className={styles.trendingCard}
                      >
                        <div className={styles.trendingImageWrapper}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.title} className={styles.trendingImage} />
                          <div className={styles.trendingGradient}></div>
                        </div>
                        <div className={styles.trendingContent}>
                          <div>
                            <h3 className={styles.trendingTitle}>{item.title}</h3>
                            <p className={styles.trendingTagline}>{item.tagline}</p>
                          </div>
                          <div className={styles.trendingArrow}>
                            <ArrowRight size={20} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Container>
              </section>
            );

          case 'newArrivals':
            return newArrivals.length > 0 ? (
              <section key="newArrivals" className={`${styles.section} ${styles.light}`}>
                <Container>
                  <header className={styles.sectionHeader}>
                    <h2>{section.title}</h2>
                    <p>{section.subtitle}</p>
                  </header>
                  <div className={styles.productsGrid}>
                    {newArrivals.map((p) => (
                      <ProductCard
                        key={p._id.toString()}
                        product={toCardProps(p)}
                        wishlistedIds={wishlistedIds}
                      />
                    ))}
                  </div>
                </Container>
              </section>
            ) : null;

          case 'featuredProducts':
            return featuredProducts.length > 0 ? (
              <section key="featuredProducts" className={styles.section}>
                <Container>
                  <header className={styles.sectionHeader}>
                    <h2>{section.title}</h2>
                    <p>{section.subtitle}</p>
                  </header>
                  <div className={styles.productsGrid}>
                    {featuredProducts.map((p) => (
                      <ProductCard
                        key={p._id.toString()}
                        product={toCardProps(p)}
                        wishlistedIds={wishlistedIds}
                      />
                    ))}
                  </div>
                </Container>
              </section>
            ) : null;

          case 'banner':
            return (
              <section
                key="banner"
                className={styles.bannerSection}
                style={{ backgroundImage: `url('${section.image}')` }}
              >
                <div className={styles.bannerOverlay}>
                  <h2 className={styles.bannerTitle}>{section.title}</h2>
                  <p className={styles.bannerSubtitle}>{section.subtitle}</p>
                  <Link href={section.button.href} className={styles.bannerBtn}>
                    {section.button.label}
                  </Link>
                </div>
              </section>
            );

          case 'newsletter':
            return (
              <section key="newsletter" className={`${styles.section} ${styles.newsletterSection}`}>
                <Container>
                  <div className={styles.newsletterInner}>
                    <h2>{section.title}</h2>
                    <p>{section.subtitle}</p>
                    <form className={styles.newsletterForm}>
                      <input type="email" placeholder="Enter your email" required />
                      <button type="submit">Subscribe</button>
                    </form>
                  </div>
                </Container>
              </section>
            );

          default:
            return null;
        }
      })}
    </main>
  );
}
