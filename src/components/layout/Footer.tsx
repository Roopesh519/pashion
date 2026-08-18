import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { siteConfig } from '@/config/site.config';
import { footerConfig } from '@/config/footer.config';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <Container>
                <div className={styles.grid}>
                    <div className={styles.brandSection}>
                        <Link href="/" className={styles.logo}>{siteConfig.name.toUpperCase()}</Link>
                        <p className={styles.tagline}>{footerConfig.tagline}</p>

                        {footerConfig.showNewsletter && (
                            <div className={styles.newsletter}>
                                <h4 className={styles.newsletterTitle}>{footerConfig.newsletterTitle}</h4>
                                <p className={styles.newsletterDesc}>{footerConfig.newsletterDescription}</p>
                                <form className={styles.form}>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className={styles.input}
                                        required
                                    />
                                    <Button variant="primary" size="sm">Subscribe</Button>
                                </form>
                            </div>
                        )}
                    </div>

                    {footerConfig.columns.map((col) => (
                        <div key={col.title} className={styles.linksColumn}>
                            <h4 className={styles.columnTitle}>{col.title}</h4>
                            {col.links.map((link) => (
                                <Link key={link.href} href={link.href} className={styles.link}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>{siteConfig.copyright}</p>
                    <div className={styles.socials}>
                        {siteConfig.social.instagram && (
                            <a href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                                <Instagram size={20} />
                            </a>
                        )}
                        {siteConfig.social.facebook && (
                            <a href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                                <Facebook size={20} />
                            </a>
                        )}
                        {siteConfig.social.twitter && (
                            <a href={siteConfig.social.twitter} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                                <Twitter size={20} />
                            </a>
                        )}
                        {siteConfig.social.youtube && (
                            <a href={siteConfig.social.youtube} aria-label="Youtube" target="_blank" rel="noopener noreferrer">
                                <Youtube size={20} />
                            </a>
                        )}
                    </div>
                </div>
            </Container>
        </footer>
    );
}
