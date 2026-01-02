import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <Container>
                <div className={styles.grid}>
                    {/* Brand & Newsletter */}
                    <div className={styles.brandSection}>
                        <Link href="/" className={styles.logo}>PASHION</Link>
                        <p className={styles.tagline}>Elevate your everyday style.</p>
                        <div className={styles.newsletter}>
                            <h4 className={styles.newsletterTitle}>Subscribe to our newsletter</h4>
                            <p className={styles.newsletterDesc}>Get the latest updates on new products and upcoming sales.</p>
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
                    </div>

                    {/* Links Columns */}
                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Shop</h4>
                        <Link href="/new-arrivals" className={styles.link}>New Arrivals</Link>
                        <Link href="/shop" className={styles.link}>All Products</Link>
                        <Link href="/collections" className={styles.link}>Collections</Link>
                        <Link href="/sale" className={styles.link}>Sale</Link>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Support</h4>
                        <Link href="/contact" className={styles.link}>Contact Us</Link>
                        <Link href="/shipping" className={styles.link}>Shipping Policy</Link>
                        <Link href="/returns" className={styles.link}>Returns & Exchanges</Link>
                        <Link href="/faq" className={styles.link}>FAQs</Link>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Company</h4>
                        <Link href="/about" className={styles.link}>About Us</Link>
                        <Link href="/careers" className={styles.link}>Careers</Link>
                        <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
                        <Link href="/terms" className={styles.link}>Terms of Service</Link>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>&copy; {new Date().getFullYear()} Pashion. All rights reserved.</p>
                    <div className={styles.socials}>
                        <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                        <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
                        <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                        <a href="#" aria-label="Youtube"><Youtube size={20} /></a>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
