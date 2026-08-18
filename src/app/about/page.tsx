import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { siteConfig } from '@/config/site.config';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: `About Us - ${siteConfig.name}`,
  description: `Learn more about ${siteConfig.name} and our mission.`,
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <h1 className={styles.title}>About {siteConfig.name}</h1>
          <p className={styles.subtitle}>{siteConfig.tagline}</p>
        </Container>
      </div>

      <Container>
        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Our Story</h2>
            <p className={styles.paragraph}>
              Welcome to {siteConfig.name}. Founded with a passion for quality, style, and authenticity, our goal is to deliver exceptional products that inspire confidence and elevate your everyday lifestyle.
            </p>
            <p className={styles.paragraph}>
              Every item in our collection is thoughtfully curated and crafted with detail. From minimalist essentials to bold statement pieces, we focus on timeless designs, premium materials, and sustainable practices.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Our Mission</h2>
            <p className={styles.paragraph}>
              We believe great style should be accessible, durable, and effortless. We are dedicated to providing our customers with an unparalleled shopping experience, exceptional customer care, and continuous innovation in modern design.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Why Choose Us</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Premium Quality:</strong> Meticulously selected fabrics and durable construction.</li>
              <li className={styles.listItem}><strong>Customer-First Service:</strong> Fast shipping, easy returns, and responsive support.</li>
              <li className={styles.listItem}><strong>Ethical & Sustainable:</strong> Partnering with responsible manufacturers worldwide.</li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
