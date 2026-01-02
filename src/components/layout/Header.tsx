"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Search, ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';
import Container from '../ui/Container';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { cartCount, setIsCartOpen } = useCart();
    const { data: session } = useSession();
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <Container className={styles.container}>
                {/* Mobile Menu Button */}
                <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    PASHION
                </Link>

                {/* Desktop Navigation */}
                <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
                    <Link href="/" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link href="/shop" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
                    <Link href="/shop" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
                    <Link href="/shop" className={`${styles.navLink} ${styles.sale}`} onClick={() => setIsMobileMenuOpen(false)}>Sale</Link>
                </nav>

                {/* Icons */}
                <div className={styles.actions}>
                    <button className={styles.iconBtn} aria-label="Search">
                        <Search size={22} />
                    </button>

                    {/* User Menu */}
                    <div style={{ position: 'relative' }} ref={userMenuRef}>
                        <button 
                            className={styles.iconBtn} 
                            aria-label="Account"
                            onClick={toggleUserMenu}
                        >
                            <User size={22} />
                        </button>
                        {isUserMenuOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                minWidth: '200px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 1000,
                                marginTop: '0.5rem',
                            }}>
                                {session ? (
                                    <>
                                        <Link href="/account" onClick={() => setIsUserMenuOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--muted)' }}>
                                            {(session.user as any)?.name || 'My Account'}
                                        </Link>
                                        <Link href="/account/orders" onClick={() => setIsUserMenuOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--muted)' }}>
                                            Orders
                                        </Link>
                                        {(session.user as any)?.role === 'admin' && (
                                            <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--muted)' }}>
                                                Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                signOut({ redirect: true, callbackUrl: '/login' });
                                            }}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '0.75rem 1rem',
                                                border: 'none',
                                                background: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            <LogOut size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" onClick={() => setIsUserMenuOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                                            Sign In
                                        </Link>
                                        <Link href="/register" onClick={() => setIsUserMenuOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem' }}>
                                            Create Account
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
                        <ShoppingBag size={22} />
                        {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                    </Link>
                </div>
            </Container>
        </header>
    );
}
