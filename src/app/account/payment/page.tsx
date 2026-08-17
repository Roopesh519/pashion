"use client";

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import Container from '@/components/ui/Container';
import styles from './page.module.css';

const CARD_ICONS = ['Visa', 'Mastercard', 'Amex', 'PayPal'];

export default function PaymentPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    return (
        <div className={styles.page}>
            <Container>
                <div className={styles.header}>
                    <Link href="/account" className={styles.backLink}>
                        <ArrowLeft size={16} /> Back to account
                    </Link>
                    <h1 className={styles.title}>Payment Methods</h1>
                    <p className={styles.subtitle}>Manage your saved payment options</p>
                </div>

                {/* Coming soon card */}
                <div className={styles.comingSoon}>
                    <div className={styles.iconWrap}>
                        <CreditCard size={40} />
                    </div>
                    <h2>Saved cards coming soon</h2>
                    <p>
                        We&apos;re integrating Stripe to let you securely save and manage payment
                        methods. For now, you can enter your card details at checkout.
                    </p>

                    <div className={styles.acceptedCards}>
                        {CARD_ICONS.map(name => (
                            <span key={name} className={styles.cardChip}>{name}</span>
                        ))}
                    </div>
                </div>

                {/* Security info */}
                <div className={styles.securityGrid}>
                    <div className={styles.securityCard}>
                        <ShieldCheck size={22} className={styles.securityIcon} />
                        <div>
                            <h4>Secure payments</h4>
                            <p>All transactions are encrypted with TLS and processed by PCI-compliant providers.</p>
                        </div>
                    </div>
                    <div className={styles.securityCard}>
                        <Lock size={22} className={styles.securityIcon} />
                        <div>
                            <h4>We never store card numbers</h4>
                            <p>Card details are tokenised by the payment processor — we only store a reference token.</p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
