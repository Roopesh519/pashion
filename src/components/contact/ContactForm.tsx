"use client";

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from '@/app/content.module.css';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--secondary)', borderRadius: 'var(--radius-card)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Thank You!</h3>
        <p style={{ color: 'var(--muted)' }}>Your message has been sent successfully. We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>Send Us a Message</h2>
      <div className={styles.formGroup}>
        <label className={styles.label}>Your Name</label>
        <input type="text" className={styles.input} placeholder="John Doe" required />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Email Address</label>
        <input type="email" className={styles.input} placeholder="john@example.com" required />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Subject</label>
        <input type="text" className={styles.input} placeholder="Order Inquiry / General Question" required />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Message</label>
        <textarea className={styles.textarea} placeholder="How can we help you?" required></textarea>
      </div>
      <Button type="submit" fullWidth size="lg">
        Send Message <Send size={18} style={{ marginLeft: '8px' }} />
      </Button>
    </form>
  );
}
