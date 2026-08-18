import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { siteConfig } from '@/config/site.config';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: `Shipping Policy - ${siteConfig.name}`,
  description: `Learn about ${siteConfig.name} shipping options, delivery times, and rates.`,
};

export default function ShippingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <h1 className={styles.title}>Shipping Policy</h1>
          <p className={styles.subtitle}>Fast, reliable delivery worldwide.</p>
        </Container>
      </div>

      <Container>
        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Processing Time</h2>
            <p className={styles.paragraph}>
              All orders are processed within 1–2 business days (excluding weekends and holidays). Once your order ships, you will receive a confirmation email with a tracking number.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Shipping Rates & Delivery Estimates</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Standard Shipping (3-5 business days):</strong> $5.99 (Free on orders over $100)</li>
              <li className={styles.listItem}><strong>Express Shipping (1-2 business days):</strong> $15.00</li>
              <li className={styles.listItem}><strong>International Shipping (7-14 business days):</strong> Calculated at checkout based on destination.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Order Tracking</h2>
            <p className={styles.paragraph}>
              When your order has shipped, you will receive an email notification from us which will include a tracking link you can use to check its status. Please allow 24 hours for the tracking information to become active.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Questions?</h2>
            <p className={styles.paragraph}>
              If you have any questions regarding your shipment, please reach out to us at <strong>{siteConfig.contact.email}</strong>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
