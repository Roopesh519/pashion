"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Eye, Loader2, RefreshCw } from 'lucide-react';
import styles from './page.module.css';

interface Order {
    _id: string;
    customerInfo: {
        email: string;
        firstName: string;
        lastName: string;
    };
    totalAmount: number;
    status: string;
    createdAt: string;
    items: any[];
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/orders');
            if (!res.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await res.json();
            setOrders(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'pending': return styles.badgePending;
            case 'processing': return styles.badgeWarning;
            case 'shipped': return styles.badgeInfo;
            case 'delivered': return styles.badgeSuccess;
            case 'cancelled': 
            case 'refunded': return styles.badgeDanger;
            default: return styles.badge;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingState}>
                    <Loader2 size={32} className={styles.spinner} />
                    <p>Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.errorState}>
                    <p>{error}</p>
                    <button onClick={fetchOrders} className={styles.retryBtn}>
                        <RefreshCw size={18} /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Orders</h1>
                    <p className={styles.subtitle}>Manage customer orders ({orders.length} total)</p>
                </div>
                <button onClick={fetchOrders} className={styles.refreshBtn} title="Refresh orders">
                    <RefreshCw size={18} />
                </button>
            </div>

            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <Package size={48} />
                    <p>No orders yet</p>
                    <span>Orders will appear here when customers make purchases</span>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className={styles.orderId}>
                                        #{order._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td>
                                        {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                                    </td>
                                    <td className={styles.email}>{order.customerInfo?.email}</td>
                                    <td>{order.items?.length || 0} items</td>
                                    <td className={styles.total}>${order.totalAmount?.toFixed(2)}</td>
                                    <td>
                                        <span className={`${styles.badge} ${getStatusClass(order.status)}`}>
                                            {formatStatus(order.status)}
                                        </span>
                                    </td>
                                    <td className={styles.date}>{formatDate(order.createdAt)}</td>
                                    <td>
                                        <Link href={`/admin/orders/${order._id}`} className={styles.viewBtn}>
                                            <Eye size={16} />
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
