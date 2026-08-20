"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Loader2, Package, MapPin, CreditCard } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/currency';
import styles from '../page.module.css';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    image?: string;
}

interface Order {
    _id: string;
    totalAmount: number;
    subtotal: number;
    shippingCost: number;
    tax: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
    trackingNumber?: string;
    customerInfo?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        address: string;
        city: string;
        state?: string;
        zip: string;
        country?: string;
    };
    paymentMethod?: string;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const { data: session, status } = useSession();
    const router = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (!id || status !== 'authenticated') return;

        fetch(`/api/orders/${id}`)
            .then((r) => {
                if (!r.ok) throw new Error('Order not found');
                return r.json();
            })
            .then((data) => {
                setOrder(data);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id, status]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (status === 'loading' || loading) {
        return (
            <div className={styles.page}>
                <Container>
                    <div className={styles.loadingState}>
                        <Loader2 size={28} className={styles.spinner} />
                        Loading order details...
                    </div>
                </Container>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className={styles.page}>
                <Container>
                    <div className={styles.emptyState}>
                        <Package size={40} />
                        <h2>Order Not Found</h2>
                        <p>{error || "We couldn't find the requested order."}</p>
                        <Link href="/account/orders">
                            <Button>Back to Orders</Button>
                        </Link>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Container>
                <div className={styles.header}>
                    <Link href="/account/orders" className={styles.backLink}>
                        <ArrowLeft size={16} /> Back to order history
                    </Link>
                    <h1 className={styles.title}>Order #{order._id.slice(-8).toUpperCase()}</h1>
                    <p className={styles.subtitle}>Placed on {formatDate(order.createdAt)}</p>
                </div>

                <div className={styles.orderCard} style={{ cursor: 'default' }}>
                    {/* Status Bar */}
                    <div className={styles.orderHeader} style={{ cursor: 'default', borderBottom: '1px solid var(--border)' }}>
                        <div className={styles.orderMeta}>
                            <span className={`${styles.badge} ${styles[`status_${order.status}`]}`}>
                                {order.status?.toUpperCase()}
                            </span>
                        </div>
                        <div className={styles.orderRight}>
                            <span className={styles.orderTotal}>Total: {formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>

                    <div className={styles.orderBody}>
                        {/* Tracking Banner if available */}
                        {order.trackingNumber && (
                            <div className={styles.tracking} style={{ marginBottom: '1.5rem' }}>
                                <Package size={16} />
                                Tracking Number: <strong>{order.trackingNumber}</strong>
                            </div>
                        )}

                        {/* Items List */}
                        <div className={styles.itemsList}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Items Ordered</h3>
                            {order.items?.map((item, i) => (
                                <div key={i} className={styles.item}>
                                    {item.image && (
                                        <img src={item.image} alt={item.name} className={styles.itemImage} />
                                    )}
                                    <div className={styles.itemInfo}>
                                        <p className={styles.itemName}>{item.name}</p>
                                        <p className={styles.itemMeta}>
                                            {item.size && `Size: ${item.size}`}
                                            {item.size && item.color && ' · '}
                                            {item.color && `Color: ${item.color}`}
                                        </p>
                                    </div>
                                    <div className={styles.itemPricing}>
                                        <span>×{item.quantity}</span>
                                        <span>{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary & Customer Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                            {/* Shipping Information */}
                            {order.customerInfo && (
                                <div style={{ background: 'var(--secondary)', padding: '1.25rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                                        <MapPin size={16} /> Shipping Address
                                    </h4>
                                    <p style={{ margin: 0, fontWeight: 600 }}>
                                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                                    </p>
                                    <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                        {order.customerInfo.address}<br />
                                        {order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zip}<br />
                                        {order.customerInfo.country}
                                    </p>
                                    {order.customerInfo.phone && (
                                        <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                            Phone: {order.customerInfo.phone}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Summary Totals */}
                            <div className={styles.orderSummary} style={{ marginTop: 0 }}>
                                <div className={styles.summaryRow}>
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.subtotal ?? order.totalAmount ?? 0)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Shipping</span>
                                    <span>{!order.shippingCost ? 'Free' : formatCurrency(order.shippingCost)}</span>
                                </div>
                                {order.tax !== undefined && (
                                    <div className={styles.summaryRow}>
                                        <span>Tax</span>
                                        <span>{formatCurrency(order.tax)}</span>
                                    </div>
                                )}
                                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                    <span>Total Amount</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
