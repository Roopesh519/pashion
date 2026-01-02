"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, User, Heart, CreditCard, LogOut, Loader2, ShoppingBag, Clock } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

interface Order {
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: any[];
}

export default function AccountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Fetch user's orders
    useEffect(() => {
        if (session?.user?.id) {
            fetchOrders();
        }
    }, [session?.user?.id]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/user/${(session?.user as any)?.id}/orders`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: '/login' });
    };

    const sections = [
        { title: 'Orders', icon: <Package size={22} />, href: '/account/orders', desc: 'View your order history' },
        { title: 'Profile', icon: <User size={22} />, href: '/account/profile', desc: 'Edit your personal info' },
        { title: 'Wishlist', icon: <Heart size={22} />, href: '/account/wishlist', desc: 'View saved items' },
        { title: 'Payment', icon: <CreditCard size={22} />, href: '/account/payment', desc: 'Manage payment methods' },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (status === 'loading') {
        return (
            <div className={styles.page}>
                <Container>
                    <div className={styles.loadingState}>
                        <Loader2 size={32} className={styles.spinner} />
                        Loading...
                    </div>
                </Container>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const user = session.user as any;

    return (
        <div className={styles.page}>
            <Container>
                <div className={styles.header}>
                    <h1 className={styles.title}>My Account</h1>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>

                <div className={styles.welcome}>
                    <h2>Hello, {user.name || 'User'}!</h2>
                    <p>Welcome back to your account dashboard. Here you can manage your orders, profile, and preferences.</p>
                </div>

                <div className={styles.grid}>
                    {sections.map((section) => (
                        <Link key={section.title} href={section.href} className={styles.card}>
                            <div className={styles.icon}>{section.icon}</div>
                            <div>
                                <h3 className={styles.cardTitle}>{section.title}</h3>
                                <p className={styles.cardDesc}>{section.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className={styles.recentOrders}>
                    <h3>
                        <Clock size={20} />
                        Recent Orders
                    </h3>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <Loader2 size={24} className={styles.spinner} />
                            Loading orders...
                        </div>
                    ) : orders.length > 0 ? (
                        <div className={styles.ordersList}>
                            {orders.slice(0, 5).map((order) => (
                                <Link 
                                    key={order._id} 
                                    href={`/account/orders/${order._id}`}
                                    className={styles.orderItem}
                                >
                                    <div className={styles.orderInfo}>
                                        <p className={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</p>
                                        <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className={styles.orderDetails}>
                                        <p className={styles.orderAmount}>${order.totalAmount.toFixed(2)}</p>
                                        <span className={`${styles.orderStatus} ${styles[`status-${order.status}`]}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            {orders.length > 5 && (
                                <Link href="/account/orders" className={styles.viewAll}>
                                    View All Orders →
                                </Link>
                            )}  
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <ShoppingBag size={40} style={{ color: '#444', marginBottom: '1rem' }} />
                            <p>No orders yet. Start shopping to see your orders here!</p>
                            <Link href="/shop">
                                <Button>Start Shopping</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
