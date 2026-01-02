"use client";

import React from 'react';
import Link from 'next/link';
import { Trash2, ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
    const shippingCost = cartTotal > 150 ? 0 : 15;
    const total = cartTotal + shippingCost;

    if (items.length === 0) {
        return (
            <div className={styles.emptyPage}>
                <Container>
                    <h1 className={styles.emptyTitle}>Your Cart is Empty</h1>
                    <p className={styles.emptyText}>Looks like you haven't added anything yet.</p>
                    <Link href="/shop">
                        <Button>Continue Shopping</Button>
                    </Link>
                </Container>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Container>
                <h1 className={styles.title}>Shopping Cart</h1>

                <div className={styles.layout}>
                    <div className={styles.items}>
                        <div className={styles.headerRow}>
                            <span>Product</span>
                            <span>Quantity</span>
                            <span>Total</span>
                        </div>

                        {items.map((item) => (
                            <div key={`${item.id}-${item.size}-${item.color}`} className={styles.itemRow}>
                                <div className={styles.productInfo}>
                                    <div className={styles.imageWrapper}>
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div>
                                        <h3 className={styles.itemName}>
                                            <Link href={`/product/${item.slug}`}>{item.name}</Link>
                                        </h3>
                                        <p className={styles.itemVariant}>{item.color} / {item.size}</p>
                                        <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className={styles.quantityControl}>
                                    <div className={styles.qtyInput}>
                                        <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}>+</button>
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className={styles.rowTotal}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>

                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span>Shipping Estimate</span>
                            <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                        </div>
                        {shippingCost > 0 && (
                            <p className={styles.shippingNote}>Free shipping on orders over $150</p>
                        )}

                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        <Link href="/checkout" style={{ width: '100%' }}>
                            <Button fullWidth size="lg">
                                Checkout <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
}
