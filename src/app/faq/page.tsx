import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { siteConfig } from '@/config/site.config';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: `Frequently Asked Questions - ${siteConfig.name}`,
  description: `Find answers to common questions about orders, shipping, sizing, and returns at ${siteConfig.name}.`,
};

const faqs = [
  {
    question: 'How do I place an order?',
    answer: 'Simply browse our store, select your desired items, sizes, and colors, and click "Add to Bag". When you are ready, proceed to checkout and follow the instructions.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, and PayPal.',
  },
  {
    question: 'How can I track my order status?',
    answer: 'Once your order ships, we will email you a tracking link. You can also view order status anytime under your Account > Orders dashboard.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for unworn items in their original condition. See our Returns & Exchanges page for more details.',
  },
  {
    question: 'How do I find the right size?',
    answer: 'Each product page includes detailed size specifications. If you are between sizes, we generally recommend sizing up for a relaxed fit.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship worldwide. International shipping rates and times are calculated automatically during checkout.',
  },
];

export default function FAQPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Container>
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>Find quick answers to common questions.</p>
        </Container>
      </div>

      <Container>
        <div className={styles.content}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{faq.question}</h3>
              <p className={styles.faqAnswer}>{faq.answer}</p>
            </div>
          ))}

          <div className={styles.section} style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2 className={styles.sectionTitle}>Still have questions?</h2>
            <p className={styles.paragraph}>
              Feel free to reach out to our customer care team at <strong>{siteConfig.contact.email}</strong>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
