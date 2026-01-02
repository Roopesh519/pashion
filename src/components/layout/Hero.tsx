import React from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.overlay}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Define Your Vibe</h1>
                    <p className={styles.subtitle}>Streetwear that speaks louder than words.</p>
                    <div className={styles.actions}>
                        <Link href="/shop">
                            <Button size="lg" className={styles.ctaBtn}>Shop New Arrivals</Button>
                        </Link>
                        <Link href="/collections">
                            <Button variant="outline" size="lg" className={styles.secondaryBtn}>View Collections</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
