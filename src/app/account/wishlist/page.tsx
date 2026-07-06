"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HeartOff, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Container from '@/components/ui/Container';
import { useToast } from '@/components/ui/ToastContainer';
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

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated' && session?.user?.id) {
            void fetchWishlist(session.user.id);
            return;
        }

        setLoading(false);
    }, [router, session?.user?.id, status]);

    const fetchWishlist = async (userId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/user/${userId}/wishlist`);
            if (!response.ok) {
                throw new Error('Unable to load wishlist');
            }

            const data = await response.json();
            setWishlist(data.wishlist || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            showToast('error', 'Unable to load your wishlist right now');
        } finally {
            setLoading(false);
        }
    };

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
                            {wishlist.length > 0 ? `${wishlist.length} saved item${wishlist.length > 1 ? 's' : ''}` : 'Save pieces you love and come back to them anytime.'}
                        </p>
                    </div>
                </div>

                {wishlist.length === 0 ? (
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
                                        <p className={styles.price}>${item.price.toFixed(2)}</p>
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
                    </div>
                )}
            </Container>
        </div>
    );
}
