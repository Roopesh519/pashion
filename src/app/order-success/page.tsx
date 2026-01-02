"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import styles from '../checkout/page.module.css';

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            if (response.ok) {
                const data = await response.json();
                setOrder(data);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Container>
                <div style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem' }}>
                    <CheckCircle
                        size={64}
                        color="var(--success, #4caf50)"
                        style={{ marginBottom: '1rem' }}
                    />
                    <h1>Order Placed Successfully!</h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '2rem' }}>
                        Thank you for your order. We're getting it ready to ship.
                    </p>

                    {loading ? (
                        <p>Loading order details...</p>
                    ) : order ? (
                        <div style={{ marginBottom: '2rem', textAlign: 'left', maxWidth: '500px', margin: '0 auto 2rem' }}>
                            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                <p>
                                    <strong>Order Number:</strong> #{order._id?.slice(-6).toUpperCase()}
                                </p>
                                <p>
                                    <strong>Total Amount:</strong> ${order.totalAmount?.toFixed(2)}
                                </p>
                                <p>
                                    <strong>Shipping To:</strong> {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                                </p>
                                <p>
                                    <strong>Email:</strong> {order.customerInfo?.email}
                                </p>
                                <p style={{ marginBottom: 0 }}>
                                    <strong>Status:</strong> <span style={{ color: 'var(--primary)' }}>{order.status?.toUpperCase()}</span>
                                </p>
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.95rem', color: 'var(--muted)' }}>
                                A confirmation email has been sent to {order.customerInfo?.email}. You can track your order from your account.
                            </p>
                        </div>
                    ) : null}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link href="/account">
                            <Button>View My Orders</Button>
                        </Link>
                        <Link href="/shop">
                            <Button variant="secondary">Continue Shopping</Button>
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
}
