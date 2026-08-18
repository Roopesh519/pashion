import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { siteConfig } from '@/config/site.config';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.name}`,
  description: `Privacy policy and data handling practices for ${siteConfig.name}.`,
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>How we protect and respect your data.</p>
        </Container>
      </div>

      <Container>
        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
            <p className={styles.paragraph}>
              When you visit or place an order on {siteConfig.name}, we collect certain information necessary to fulfill your purchases and improve your experience. This includes your name, shipping address, email address, phone number, and payment details.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. How We Use Your Information</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>To process orders, shipping, and return requests.</li>
              <li className={styles.listItem}>To communicate order confirmations, updates, and customer support.</li>
              <li className={styles.listItem}>To improve website navigation, security, and product offerings.</li>
              <li className={styles.listItem}>To send promotional news and offers (only if you opt-in).</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Data Security & Third Parties</h2>
            <p className={styles.paragraph}>
              We implement industry-standard encryption and security measures. We do not sell your personal information to third parties. We share data only with essential service providers (e.g. payment processors and shipping carriers) required to operate our service.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Contact Us</h2>
            <p className={styles.paragraph}>
              If you have any questions regarding our Privacy Policy or your data rights, please contact us at <strong>{siteConfig.contact.email}</strong>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
