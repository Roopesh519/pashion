"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, Loader2, RefreshCw, DollarSign, Clock, CheckCircle, Truck } from 'lucide-react';
import styles from '../shared/listing.module.css';

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

    // Derived data
    const filtered = orders.filter(o => (statusFilter ? o.status === statusFilter : true));
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Stats
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const processingCount = orders.filter(o => o.status === 'processing').length;
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;

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
                    <Loader2 size={40} className={styles.spinner} />
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
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>
                        <ShoppingBag size={24} />
                    </div>
                    <div className={styles.headerText}>
                        <h1>Orders</h1>
                        <p>Manage customer orders ({orders.length} total)</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={fetchOrders} className={styles.toolbarBtn} title="Refresh orders">
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <DollarSign size={22} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconYellow}`}>
                        <Clock size={22} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{pendingCount}</h3>
                        <p>Pending</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                        <Truck size={22} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{processingCount}</h3>
                        <p>Processing</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                        <CheckCircle size={22} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{deliveredCount}</h3>
                        <p>Delivered</p>
                    </div>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <ShoppingBag size={48} />
                    <p>No orders yet</p>
                    <span>Orders will appear here when customers make purchases</span>
                </div>
            ) : (
                <>
                    {/* Table */}
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
                                {paginated.map((order) => (
                                    <tr key={order._id}>
                                        <td className={styles.cellMono}>
                                            #{order._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className={styles.cellPrimary}>
                                            {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                                        </td>
                                        <td className={styles.cellMuted}>{order.customerInfo?.email}</td>
                                        <td>{order.items?.length || 0} items</td>
                                        <td className={styles.cellBold}>${order.totalAmount?.toFixed(2)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${getStatusClass(order.status)}`}>
                                                {formatStatus(order.status)}
                                            </span>
                                        </td>
                                        <td className={styles.cellMuted}>{formatDate(order.createdAt)}</td>
                                        <td>
                                            <Link href={`/admin/orders/${order._id}`} className={styles.viewBtn}>
                                                <Eye size={14} />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={styles.paginationRow}>
                        <div className={styles.paginationFilters}>
                            <div className={styles.filterGroup}>
                                <label>Status:</label>
                                <select 
                                    value={statusFilter} 
                                    onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Per page:</label>
                                <select 
                                    value={pageSize} 
                                    onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.paginationControls}>
                            <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                            <button 
                                className={styles.pageBtn} 
                                disabled={currentPage <= 1} 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                Prev
                            </button>
                            <button 
                                className={styles.pageBtn} 
                                disabled={currentPage >= totalPages} 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
