"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Eye, Loader2, RefreshCw } from 'lucide-react';
import styles from './page.module.css';
import BulkOrderActions from '@/components/admin/BulkOrderActions';

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
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

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

    // derived
    const filtered = orders.filter(o => (statusFilter ? o.status === statusFilter : true));
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <BulkOrderActions getSelected={() => Object.keys(selected).filter(k => selected[k])} />
                  <button onClick={fetchOrders} className={styles.refreshBtn} title="Refresh orders">
                    <RefreshCw size={18} />
                  </button>
                </div>
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
                                <th style={{ width: 48 }}>
                                  <input type="checkbox" onChange={e => {
                                    const checked = e.currentTarget.checked;
                                    const newSel: Record<string, boolean> = {};
                                    orders.forEach(o => newSel[o._id] = checked);
                                    setSelected(newSel);
                                  }} />
                                </th>
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
                            {paginated.map((order) => (
                                <tr key={order._id}>
                                    <td>
                                      <input type="checkbox" checked={!!selected[order._id]} onChange={e => {
                                        setSelected(prev => ({ ...prev, [order._id]: e.currentTarget.checked }));
                                      }} />
                                    </td>
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <label style={{ color: 'var(--muted)' }}>Status:</label>
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '0.4rem', borderRadius: 6 }}>
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                        </select>
                        <label style={{ color: 'var(--muted)' }}>Per page:</label>
                        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '0.4rem', borderRadius: 6 }}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ color: 'var(--muted)' }}>Page {currentPage} / {totalPages}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="actionBtn" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Prev</button>
                            <button className="actionBtn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next</button>
                        </div>
                    </div>
                </div>
        </div>
    );
}
