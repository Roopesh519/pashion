import type { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';
import Container from '@/components/ui/Container';
import ContactForm from '@/components/contact/ContactForm';
import { siteConfig } from '@/config/site.config';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: `Contact Us - ${siteConfig.name}`,
  description: `Get in touch with the ${siteConfig.name} team.`,
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>Have a question or need assistance? We're here to help.</p>
        </Container>
      </div>

      <Container>
        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}><Mail size={24} /></div>
            <h3 className={styles.cardTitle}>Email Us</h3>
            <p className={styles.cardDetail}>{siteConfig.contact.email || 'support@example.com'}</p>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.contactIcon}><Phone size={24} /></div>
            <h3 className={styles.cardTitle}>Call Us</h3>
            <p className={styles.cardDetail}>{siteConfig.contact.phone || '+1 (555) 000-0000'}</p>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.contactIcon}><MapPin size={24} /></div>
            <h3 className={styles.cardTitle}>Visit Us</h3>
            <p className={styles.cardDetail}>{siteConfig.contact.address || '123 Fashion Ave, Design District'}</p>
          </div>
        </div>

        <div className={styles.content}>
          <ContactForm />
        </div>
      </Container>
    </div>
  );
}
