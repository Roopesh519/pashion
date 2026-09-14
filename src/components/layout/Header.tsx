"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [logoError, setLogoError] = useState(false);
    const { cartCount } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const urlSearchParams = useSearchParams();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const currentSearch = urlSearchParams.get('search') || '';
    const previousUrlSearchRef = useRef(currentSearch);
    const isCollectionPage = /^\/collections\/[^/]+$/.test(pathname);
    const searchPath = isCollectionPage ? pathname : '/shop';

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

    useEffect(() => {
        if (isSearchOpen) searchInputRef.current?.focus();
    }, [isSearchOpen]);

    useEffect(() => {
        if (previousUrlSearchRef.current !== currentSearch) {
            previousUrlSearchRef.current = currentSearch;
            setSearchTerm(currentSearch);
        }
    }, [currentSearch]);

    const updateSearch = useCallback((value: string) => {
        const params = new URLSearchParams(searchPath === pathname ? urlSearchParams.toString() : '');
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        const query = params.toString();
        router.replace(`${searchPath}${query ? `?${query}` : ''}`, { scroll: false });
    }, [pathname, router, searchPath, urlSearchParams]);

    useEffect(() => {
        if (!isSearchOpen || searchTerm.trim() === currentSearch) return;

        if (!searchTerm.trim()) {
            updateSearch('');
            return;
        }

        const timeout = window.setTimeout(() => updateSearch(searchTerm.trim()), 300);
        return () => window.clearTimeout(timeout);
    }, [currentSearch, isSearchOpen, searchTerm, updateSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        if (isSearchOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSearchOpen]);

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = searchTerm.trim();
        updateSearch(query);
        setIsSearchOpen(false);
    };

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
                    <span>{siteConfig.name.toUpperCase()}</span>
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
                        <div className={styles.searchContainer} ref={searchContainerRef}>
                            <button
                                className={styles.iconBtn}
                                aria-label="Search products"
                                aria-expanded={isSearchOpen}
                                aria-controls="global-product-search"
                                onClick={() => {
                                    setSearchTerm(currentSearch);
                                    setIsSearchOpen((open) => !open);
                                }}
                            >
                                <Search size={22} />
                            </button>
                            {isSearchOpen && (
                                <form id="global-product-search" className={styles.searchForm} onSubmit={handleSearch} role="search">
                                    <label htmlFor="product-search" className={styles.visuallyHidden}>Search all products</label>
                                    <input
                                        ref={searchInputRef}
                                        id="product-search"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Escape') setIsSearchOpen(false);
                                        }}
                                        placeholder="Search all products"
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            className={styles.clearSearchBtn}
                                            onClick={() => {
                                                setSearchTerm('');
                                                updateSearch('');
                                                searchInputRef.current?.focus();
                                            }}
                                            aria-label="Clear search"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                    <button type="submit" aria-label="Submit product search">
                                        <Search size={18} />
                                    </button>
                                </form>
                            )}
                        </div>
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
                                                onClick={() => { setIsUserMenuOpen(false); signOut({ redirect: true, callbackUrl: `${window.location.origin}/login` }); }}
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
