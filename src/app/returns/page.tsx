import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { siteConfig } from '@/config/site.config';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: `Returns & Exchanges - ${siteConfig.name}`,
  description: `Hassle-free 30-day returns and exchange policy for ${siteConfig.name}.`,
};

export default function ReturnsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <h1 className={styles.title}>Returns & Exchanges</h1>
          <p className={styles.subtitle}>Our 30-day hassle-free policy.</p>
        </Container>
      </div>

      <Container>
        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>30-Day Return Policy</h2>
            <p className={styles.paragraph}>
              We want you to love your purchase. If you are not entirely satisfied, we accept returns of unworn, unwashed, and undamaged items within 30 days of delivery for a full refund or exchange.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Return Eligibility</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>Items must be in original condition with all tags attached.</li>
              <li className={styles.listItem}>Final sale items and gift cards are not eligible for return.</li>
              <li className={styles.listItem}>Proof of purchase (order confirmation or invoice) is required.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>How to Initiate a Return</h2>
            <p className={styles.paragraph}>
              To start a return or exchange, please email our support team at <strong>{siteConfig.contact.email}</strong> with your order number and item details. We will provide a prepaid shipping label and step-by-step instructions.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Refund Processing</h2>
            <p className={styles.paragraph}>
              Once your return is received and inspected, we will notify you of the approval status. Approved refunds will be credited back to your original payment method within 5–7 business days.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
