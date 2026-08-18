import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { siteConfig } from '@/config/site.config';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: `Careers - ${siteConfig.name}`,
  description: `Join the team at ${siteConfig.name}. Explore open career opportunities.`,
};

export default function CareersPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <h1 className={styles.title}>Careers at {siteConfig.name}</h1>
          <p className={styles.subtitle}>Help us shape the future of modern e-commerce and retail design.</p>
        </Container>
      </div>

      <Container>
        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Work With Us</h2>
            <p className={styles.paragraph}>
              At {siteConfig.name}, we are driven by creativity, innovation, and teamwork. We empower our team members to push boundaries, take ownership, and craft extraordinary experiences for our customers worldwide.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Why You'll Love It Here</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Flexible Work:</strong> Remote-friendly culture with hybrid opportunities.</li>
              <li className={styles.listItem}><strong>Competitive Benefits:</strong> Health coverage, generous PTO, and employee discount perks.</li>
              <li className={styles.listItem}><strong>Growth & Learning:</strong> Budget for courses, conferences, and career progression.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Open Positions</h2>
            <p className={styles.paragraph}>
              We are always on the lookout for talented individuals in design, software engineering, digital marketing, and customer experience.
            </p>
            <p className={styles.paragraph}>
              Don't see a specific role listed? Send your resume and portfolio to <strong>{siteConfig.contact.email}</strong>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
