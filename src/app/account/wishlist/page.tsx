"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HeartOff, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Container from '@/components/ui/Container';
import { useToast } from '@/components/ui/ToastContainer';
import { formatCurrency } from '@/lib/currency';
import styles from './page.module.css';

interface WishlistItem {
    _id: string;
    name: string;
    price: number;
    slug: string;
    images?: string[];
}

export default function WishlistPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { showToast } = useToast();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const abortRef = useRef<AbortController | null>(null);

    const fetchWishlist = useCallback(async (userId: string, offset: number, limit: number, append: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            const response = await fetch(`/api/user/${userId}/wishlist?offset=${offset}&limit=${limit}`, { signal: controller.signal });
            if (!response.ok) {
                throw new Error('Unable to load wishlist');
            }

            const data = await response.json();
            setWishlist((current) => append ? [...current, ...(data.wishlist || []).filter((item: WishlistItem) => !current.some((currentItem) => currentItem._id === item._id))] : (data.wishlist || []));
            setTotal(data.pagination?.total || 0);
            setHasMore(Boolean(data.pagination?.hasMore));
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error fetching wishlist:', error);
                showToast('error', 'Unable to load your wishlist right now');
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
            loadingRef.current = false;
        }
    }, [showToast]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated' && session?.user?.id) {
            void fetchWishlist(session.user.id, 0, 10, false);
            return;
        }

        setLoading(false);
    }, [fetchWishlist, router, session?.user?.id, status]);

    useEffect(() => () => abortRef.current?.abort(), []);

    const loadMore = useCallback(() => {
        if (session?.user?.id && hasMore) void fetchWishlist(session.user.id, wishlist.length, 20, true);
    }, [fetchWishlist, hasMore, session?.user?.id, wishlist.length]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) loadMore();
        }, { rootMargin: '300px' });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    const handleRemove = async (productId: string) => {
        if (!session?.user?.id) return;

        try {
            const response = await fetch(`/api/user/${session.user.id}/wishlist?productId=${encodeURIComponent(productId)}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Unable to remove item');
            }

            setWishlist((prev) => prev.filter((item) => item._id !== productId));
            setTotal((current) => Math.max(0, current - 1));
            showToast('success', 'Removed from wishlist');
        } catch (error: any) {
            showToast('error', error.message || 'Unable to remove item');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className={styles.page}>
                <Container>
                    <div className={styles.loadingState}>
                        <Loader2 size={32} className={styles.spinner} />
                        Loading your wishlist...
                    </div>
                </Container>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className={styles.page}>
            <Container>
                <div className={styles.header}>
                    <div>
                        <Link href="/account" className={styles.backLink}>
                            <ArrowLeft size={16} /> Back to account
                        </Link>
                        <h1 className={styles.title}>My Wishlist</h1>
                        <p className={styles.subtitle}>
                            {total > 0 ? `${total} saved item${total !== 1 ? 's' : ''}` : 'Save pieces you love and come back to them anytime.'}
                        </p>
                    </div>
                </div>

                {wishlist.length === 0 && total === 0 ? (
                    <div className={styles.emptyState}>
                        <HeartOff size={40} />
                        <h2>Your wishlist is empty</h2>
                        <p>Tap the heart on a product to save it here for later.</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {wishlist.map((item) => (
                            <article key={item._id} className={styles.card}>
                                <div className={styles.imageWrap}>
                                    {item.images?.[0] ? (
                                        <img src={item.images[0]} alt={item.name} className={styles.image} />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>No image</div>
                                    )}
                                </div>
                                <div className={styles.content}>
                                    <div>
                                        <h3 className={styles.name}>{item.name}</h3>
                                        <p className={styles.price}>{formatCurrency(item.price)}</p>
                                    </div>
                                    <div className={styles.actions}>
                                        <Link href={`/product/${item.slug}`} className={styles.primaryAction}>
                                            <ShoppingBag size={16} /> View product
                                        </Link>
                                        <button className={styles.secondaryAction} onClick={() => handleRemove(item._id)}>
                                            <HeartOff size={16} /> Remove
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                        {loadingMore && Array.from({ length: 4 }, (_, index) => <div key={`skeleton-${index}`} className={styles.cardSkeleton} aria-hidden="true" />)}
                    </div>
                )}
                {hasMore && <div ref={sentinelRef} className={styles.loadMoreSentinel} aria-label="Loading more wishlist items" />}
            </Container>
        </div>
    );
}
