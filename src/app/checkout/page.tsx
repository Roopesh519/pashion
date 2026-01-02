"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const shippingCost = cartTotal > 150 ? 0 : 15;
    const tax = Math.round(cartTotal * 0.08 * 100) / 100; // 8% tax
    const total = cartTotal + shippingCost + tax;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: (session?.user as any)?.email || '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Validate form
            if (!formData.email || !formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.zip) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            const orderData = {
                user: (session?.user as any)?.id || null,
                customerInfo: {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    country: formData.country,
                },
                items: items.map((item) => ({
                    product: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size,
                    color: item.color,
                    image: item.image,
                })),
                subtotal: parseFloat(cartTotal.toFixed(2)),
                shippingCost: shippingCost,
                tax: tax,
                totalAmount: parseFloat(total.toFixed(2)),
                paymentMethod: 'credit_card', // Can be expanded to include other methods
                shippingMethod: 'standard',
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to place order');
                setLoading(false);
                return;
            }

            // Clear cart and redirect to success page
            clearCart();
            router.push(`/order-success?orderId=${data._id}`);
        } catch (err: any) {
            setError(err?.message || 'An error occurred while placing your order');
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className={styles.emptyPage}>
                <Container>
                    <h1>Your cart is empty</h1>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--muted)' }}>Add items to your cart before checking out.</p>
                    <Link href="/shop"><Button>Return to Shop</Button></Link>
                </Container>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Container>
                <div className={styles.layout}>
                    <div className={styles.main}>
                        <h1 className={styles.title}>Checkout</h1>

                        {error && <div className={styles.error}>{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Contact Information</h2>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email address"
                                        className={styles.input}
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Shipping Address</h2>
                                <div className={styles.row}>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First name"
                                        className={styles.input}
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last name"
                                        className={styles.input}
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone number"
                                        className={styles.input}
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Street Address"
                                        className={styles.input}
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.row}>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        className={styles.input}
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="State/Province"
                                        className={styles.input}
                                        value={formData.state}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.row}>
                                    <input
                                        type="text"
                                        name="zip"
                                        placeholder="ZIP/Postal Code"
                                        className={styles.input}
                                        required
                                        value={formData.zip}
                                        onChange={handleChange}
                                    />
                                    <select
                                        name="country"
                                        className={styles.input}
                                        value={formData.country}
                                        onChange={handleChange}
                                    >
                                        <option value="US">United States</option>
                                        <option value="CA">Canada</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="AU">Australia</option>
                                    </select>
                                </div>
                            </div>

                            <Button type="submit" fullWidth size="lg" disabled={loading}>
                                {loading ? 'Processing...' : 'Place Order'}
                            </Button>
                        </form>
                    </div>

                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>

                        <div className={styles.summaryItems}>
                            {items.map((item) => (
                                <div key={`${item.id}-${item.size}-${item.color}`} className={styles.summaryItem}>
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax (8%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                        </div>
                        {shippingCost > 0 && (
                            <p className={styles.note}>Free shipping on orders over $150</p>
                        )}

                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
