"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Heart, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '../ui/Button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/ToastContainer';
import styles from './ProductInfo.module.css';

interface ProductInfoProps {
    product: {
        id: string;
        name: string;
        price: number;
        description: string;
        sizes: string[];
        colors: { name: string; value: string }[];
        images: string[];
        slug: string;
    };
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const { addToCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            fetchWishlist();
        } else if (status === 'unauthenticated') {
            setIsWishlisted(false);
        }
    }, [status, session?.user?.id, product.id]);

    const fetchWishlist = async () => {
        try {
            const response = await fetch(`/api/user/${session?.user?.id}/wishlist`);
            if (!response.ok) return;

            const data = await response.json();
            const wishlist: any[] = data.wishlist || [];
            setIsWishlisted(wishlist.some((item) => item._id?.toString() === product.id));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            showToast('warning', 'Please select a size');
            return;
        }

        if (product.colors.length > 0 && !selectedColor) {
            showToast('warning', 'Please select a color');
            return;
        }

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            size: selectedSize,
            color: selectedColor || 'Default',
            quantity: quantity,
            slug: product.slug
        });

        showToast('success', 'Added to cart');
    };

    const handleWishlistToggle = async () => {
        if (status === 'loading') return;

        if (status !== 'authenticated' || !session?.user?.id) {
            showToast('info', 'Please sign in to save items');
            router.push('/login');
            return;
        }

        setIsWishlistLoading(true);

        try {
            const endpoint = `/api/user/${session.user.id}/wishlist`;
            const method = isWishlisted ? 'DELETE' : 'POST';
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (!isWishlisted) {
                options.body = JSON.stringify({ productId: product.id });
            }

            const response = await fetch(
                isWishlisted
                    ? `${endpoint}?productId=${encodeURIComponent(product.id)}`
                    : endpoint,
                options
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unable to update wishlist');
            }

            setIsWishlisted(!isWishlisted);
            showToast('success', isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
        } catch (error: any) {
            showToast('error', error.message || 'Unable to update wishlist');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    return (
        <div className={styles.info}>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.price}>${product.price.toFixed(2)}</p>

            {product.colors.length > 0 && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Color: {selectedColor}</h3>
                    <div className={styles.colorGrid}>
                        {product.colors.map((color) => (
                            <button
                                key={color.name}
                                className={`${styles.colorBtn} ${selectedColor === color.name ? styles.activeColor : ''}`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => setSelectedColor(color.name)}
                                aria-label={color.name}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Size: {selectedSize}</h3>
                <div className={styles.sizeGrid}>
                    {product.sizes.map((size) => (
                        <button
                            key={size}
                            className={`${styles.sizeBtn} ${selectedSize === size ? styles.activeSize : ''}`}
                            onClick={() => setSelectedSize(size)}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.description}>
                <p>{product.description}</p>
            </div>

            <div className={styles.actions}>
                <div className={styles.quantity}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                <Button size="lg" className={styles.addBtn} onClick={handleAddToCart} fullWidth>
                    <ShoppingBag size={20} style={{ marginRight: '8px' }} /> Add to Cart
                </Button>
            </div>

            <div className={styles.secondaryActions}>
                <button
                    className={`${styles.actionLink} ${isWishlisted ? styles.wishlistActive : ''}`}
                    onClick={handleWishlistToggle}
                    disabled={isWishlistLoading}
                >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                    {isWishlistLoading ? 'Please wait...' : isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
                <button className={styles.actionLink}><Share2 size={18} /> Share</button>
            </div>
        </div>
    );
}
