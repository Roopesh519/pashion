import React from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import { themeConfig } from '@/config/theme.config';
import styles from './Hero.module.css';

interface HeroProps {
    title: string;
    subtitle: string;
    image: string;
    primaryButton: { label: string; href: string };
    secondaryButton: { label: string; href: string };
}

export default function Hero({ title, subtitle, image, primaryButton, secondaryButton }: HeroProps) {
    const heroVariant = themeConfig.style.hero || 'full-width';

    return (
        <section className={styles.hero} data-variant={heroVariant} style={{ backgroundImage: `url('${image}')` }}>
            <div className={styles.overlay}>
                <div className={styles.content}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>
                    <div className={styles.actions}>
                        <Link href={primaryButton.href}>
                            <Button size="lg" className={styles.ctaBtn}>{primaryButton.label}</Button>
                        </Link>
                        <Link href={secondaryButton.href}>
                            <Button variant="outline" size="lg" className={styles.secondaryBtn}>{secondaryButton.label}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

