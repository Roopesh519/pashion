import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { siteConfig } from '@/config/site.config';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: `Terms of Service - ${siteConfig.name}`,
  description: `Terms and conditions for using ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>Please read these terms carefully before using our site.</p>
        </Container>
      </div>

      <Container>
        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p className={styles.paragraph}>
              By accessing or purchasing from {siteConfig.name}, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Product Availability & Pricing</h2>
            <p className={styles.paragraph}>
              All prices and product availability are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We make every effort to display product colors and images as accurately as possible.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Intellectual Property</h2>
            <p className={styles.paragraph}>
              All content on this site, including images, graphics, logos, text, and code, is the property of {siteConfig.name} and is protected by copyright and intellectual property laws.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Governing Law</h2>
            <p className={styles.paragraph}>
              These Terms of Service are governed by and construed in accordance with applicable laws. Any disputes shall be handled in accordance with local regulations.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
