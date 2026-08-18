"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Search, ShoppingBag, User, Menu, X, LogOut, Heart } from 'lucide-react';
import Container from '../ui/Container';
import { useCart } from '@/context/CartContext';
import { siteConfig } from '@/config/site.config';
import { themeConfig } from '@/config/theme.config';
import { navigationConfig } from '@/config/navigation.config';
import { headerConfig } from '@/config/header.config';
import styles from './Header.module.css';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const { cartCount } = useCart();
    const { data: session } = useSession();
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        if (isUserMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen]);

    const headerVariant = themeConfig.style.header || 'modern';
    const isSticky = headerConfig.sticky;

    return (
        <header
            className={`${styles.header} ${isSticky ? styles.stickyHeader : ''} ${isScrolled ? styles.scrolled : ''}`}
            data-variant={headerVariant}
        >
            <Container className={styles.container}>
                <button className={styles.mobileMenuBtn} onClick={() => setIsMobileMenuOpen(v => !v)} aria-label="Toggle Menu">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <Link href="/" className={styles.logo}>
                    {siteConfig.logo && !logoError ? (
                        <img
                            src={siteConfig.logo}
                            alt={siteConfig.name}
                            className={styles.logoImage}
                            onError={() => setLogoError(true)}
                        />
                    ) : (
                        <span>{siteConfig.name.toUpperCase()}</span>
                    )}
                </Link>

                <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
                    {navigationConfig.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${item.highlight ? styles.sale : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.actions}>
                    {headerConfig.showSearch && (
                        <Link href="/shop" className={styles.iconBtn} aria-label="Search">
                            <Search size={22} />
                        </Link>
                    )}

                    {headerConfig.showWishlist && (
                        <Link href="/account/wishlist" className={styles.iconBtn} aria-label="Wishlist">
                            <Heart size={22} />
                        </Link>
                    )}

                    {headerConfig.showAccount && (
                        <div style={{ position: 'relative' }} ref={userMenuRef}>
                            <button
                                className={styles.iconBtn}
                                aria-label="Account"
                                onClick={() => setIsUserMenuOpen(v => !v)}
                            >
                                <User size={22} />
                            </button>
                            {isUserMenuOpen && (
                                <div className={styles.userDropdown}>
                                    {session ? (
                                        <>
                                            <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className={styles.dropdownLink}>
                                                {(session.user as any)?.name || 'My Account'}
                                            </Link>
                                            <Link href="/account/orders" onClick={() => setIsUserMenuOpen(false)} className={styles.dropdownLink}>
                                                Orders
                                            </Link>
                                            {(session.user as any)?.role === 'admin' && (
                                                <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className={styles.dropdownLink}>
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => { setIsUserMenuOpen(false); signOut({ redirect: true, callbackUrl: '/login' }); }}
                                                className={styles.dropdownBtn}
                                            >
                                                <LogOut size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/login" onClick={() => setIsUserMenuOpen(false)} className={styles.dropdownLinkDark}>
                                                Sign In
                                            </Link>
                                            <Link href="/register" onClick={() => setIsUserMenuOpen(false)} className={styles.dropdownLinkDark}>
                                                Create Account
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {headerConfig.showCart && (
                        <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
                            <ShoppingBag size={22} />
                            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                        </Link>
                    )}
                </div>
            </Container>
        </header>
    );
}

