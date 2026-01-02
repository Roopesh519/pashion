"use client";

import React, { useState } from 'react';
import { ShoppingBag, Heart, Share2 } from 'lucide-react';
import Button from '../ui/Button';
import { useCart } from '@/context/CartContext';
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
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        // Color is optional if no colors are available
        if (product.colors.length > 0 && !selectedColor) {
            alert('Please select a color');
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

        // Optional: could show toast notification here
        alert('Added to cart!');
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
                <button className={styles.actionLink}><Heart size={18} /> Add to Wishlist</button>
                <button className={styles.actionLink}><Share2 size={18} /> Share</button>
            </div>
        </div>
    );
}
