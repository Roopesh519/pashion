import React from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import { themeConfig } from '@/config/theme.config';
import styles from './Hero.module.css';

interface HeroProps {
    image: string;
    mobileImage?: string;
    primaryButton: { label: string; href: string };
    secondaryButton: { label: string; href: string };
}

export default function Hero({ image, mobileImage, primaryButton, secondaryButton }: HeroProps) {
    const heroVariant = themeConfig.style.hero || 'full-width';

    return (
        <section className={styles.hero} data-variant={heroVariant}>
            <picture className={styles.background}>
                {mobileImage ? <source media="(max-width: 768px)" srcSet={mobileImage} /> : null}
                <img src={image} alt="" aria-hidden="true" />
            </picture>
            <div className={styles.actions} aria-label="Hero actions">
                <Link href={primaryButton.href}>
                    <Button size="sm" className={styles.ctaBtn}>{primaryButton.label}</Button>
                </Link>
                <Link href={secondaryButton.href}>
                    <Button variant="outline" size="sm" className={styles.secondaryBtn}>{secondaryButton.label}</Button>
                </Link>
            </div>
        </section>
    );
}
