import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import Button from '../ui/Button';
import WishlistButton from './WishlistButton';
import styles from './ProductCard.module.css';

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    hoverImage?: string;
    badge?: string;
    slug: string;
}

interface ProductCardProps {
    product: Product;
    wishlistedIds?: Set<string>;
}

export default function ProductCard({ product, wishlistedIds }: ProductCardProps) {
    return (
        <div className={styles.card}>
            <Link href={`/product/${product.slug}`} className={styles.imageLink}>
                <div className={styles.imageWrapper}>
                    {product.badge && <div className={styles.badge}>{product.badge}</div>}
                    <WishlistButton
                        productId={product.id}
                        slug={product.slug}
                        isWishlisted={wishlistedIds ? wishlistedIds.has(product.id) : undefined}
                    />
                    <img
                        src={product.image}
                        alt={product.name}
                        className={styles.mainImage}
                    />
                    {product.hoverImage && (
                        <img
                            src={product.hoverImage}
                            alt={product.name}
                            className={styles.hoverImage}
                        />
                    )}
                    <div className={styles.overlay}>
                        <Button size="sm" fullWidth className={styles.quickAdd}>
                            Quick Add <ShoppingBag size={16} style={{ marginLeft: '8px' }} />
                        </Button>
                    </div>
                </div>
            </Link>

            <div className={styles.details}>
                <h3 className={styles.name}>
                    <Link href={`/product/${product.slug}`}>{product.name}</Link>
                </h3>
                <div className={styles.priceContainer}>
                    <span className={styles.price}>${product.price}</span>
                    {product.originalPrice && (
                        <span className={styles.originalPrice}>${product.originalPrice}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
