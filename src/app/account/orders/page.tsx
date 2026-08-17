"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ShoppingBag, Package, ChevronDown, ChevronUp } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

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
    customerInfo?: { address: string; city: string; state?: string; zip: string; country?: string };
}

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (!session?.user?.id) return;
        fetch(`/api/user/${(session.user as any).id}/orders`)
            .then(r => r.json())
            .then(d => setOrders(d.orders || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [session?.user?.id]);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (status === 'loading' || loading) {
        return (
            <div className={styles.page}>
                <Container>
                    <div className={styles.loadingState}>
                        <Loader2 size={28} className={styles.spinner} /> Loading orders...
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Container>
                <div className={styles.header}>
                    <Link href="/account" className={styles.backLink}>
                        <ArrowLeft size={16} /> Back to account
                    </Link>
                    <h1 className={styles.title}>Order History</h1>
                    <p className={styles.subtitle}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
                </div>

                {orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <ShoppingBag size={40} />
                        <h2>No orders yet</h2>
                        <p>When you place an order it will appear here.</p>
                        <Link href="/shop"><Button>Start Shopping</Button></Link>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {orders.map(order => (
                            <div key={order._id} className={styles.orderCard}>
                                {/* Order Header */}
                                <div className={styles.orderHeader} onClick={() => setExpanded(e => e === order._id ? null : order._id)}>
                                    <div className={styles.orderMeta}>
                                        <span className={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                                        <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className={styles.orderRight}>
                                        <span className={`${styles.badge} ${styles[`status_${order.status}`]}`}>
                                            {order.status}
                                        </span>
                                        <span className={styles.orderTotal}>${order.totalAmount.toFixed(2)}</span>
                                        {expanded === order._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expanded === order._id && (
                                    <div className={styles.orderBody}>
                                        <div className={styles.itemsList}>
                                            {order.items.map((item, i) => (
                                                <div key={i} className={styles.item}>
                                                    {item.image && <img src={item.image} alt={item.name} className={styles.itemImage} />}
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
                                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className={styles.orderSummary}>
                                            <div className={styles.summaryRow}><span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
                                            <div className={styles.summaryRow}><span>Shipping</span><span>{order.shippingCost === 0 ? 'Free' : `$${order.shippingCost?.toFixed(2)}`}</span></div>
                                            <div className={styles.summaryRow}><span>Tax</span><span>${order.tax?.toFixed(2)}</span></div>
                                            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>Total</span><span>${order.totalAmount.toFixed(2)}</span></div>
                                        </div>

                                        {order.trackingNumber && (
                                            <div className={styles.tracking}>
                                                <Package size={14} />
                                                Tracking: <strong>{order.trackingNumber}</strong>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}
