"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Package, 
    User, 
    MapPin, 
    CreditCard, 
    Truck,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    ShoppingBag,
    Save
} from 'lucide-react';
import styles from './page.module.css';

export default function AdminOrderDetail() {
    const params = useParams() as { id: string };
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('pending');
    const [tracking, setTracking] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`/api/orders?id=${params.id}`);
                if (!res.ok) {
                    setError('Failed to load order');
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                const ord = Array.isArray(data) ? data[0] : data;
                setOrder(ord);
                setStatus(ord?.status || 'pending');
                setTracking(ord?.trackingNumber || '');
            } catch (err) {
                setError('Failed to load order');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    const handleUpdate = async () => {
        setError(null);
        setSuccess(null);
        setSaving(true);
        
        try {
            const res = await fetch(`/api/admin/orders/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, trackingNumber: tracking }),
            });
            
            if (!res.ok) {
                const d = await res.json();
                setError(d.error || 'Failed to update order');
                return;
            }
            
            setSuccess('Order updated successfully');
            setOrder({ ...order, status, trackingNumber: tracking });
        } catch (err) {
            setError('Failed to update order');
        } finally {
            setSaving(false);
        }
    };

    const getStatusClass = (s: string) => {
        switch (s) {
            case 'pending': return styles.statusPending;
            case 'processing': return styles.statusProcessing;
            case 'shipped': return styles.statusShipped;
            case 'delivered': return styles.statusDelivered;
            case 'cancelled': return styles.statusCancelled;
            default: return styles.statusPending;
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'pending': return <Clock size={14} />;
            case 'processing': return <Package size={14} />;
            case 'shipped': return <Truck size={14} />;
            case 'delivered': return <CheckCircle size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <Loader2 size={40} className={styles.spinner} />
                    <p className={styles.loadingText}>Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={styles.page}>
                <div className={styles.notFound}>
                    <Package size={64} className={styles.notFoundIcon} />
                    <h2 className={styles.notFoundTitle}>Order Not Found</h2>
                    <p className={styles.notFoundText}>The order you're looking for doesn't exist or has been removed.</p>
                    <Link href="/admin/orders" className={styles.backLink}>
                        <ArrowLeft size={18} />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const subtotal = order.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0;

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/admin/orders')}>
                    <ArrowLeft size={20} />
                </button>
                <div className={styles.headerInfo}>
                    <h1 className={styles.orderId}>
                        Order
                        <span className={styles.orderIdCode}>#{order._id?.slice(-8).toUpperCase()}</span>
                    </h1>
                    <p className={styles.orderDate}>
                        Placed on {formatDate(order.createdAt)}
                    </p>
                </div>
                <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                </span>
            </div>

            <div className={styles.grid}>
                {/* Main Content */}
                <div>
                    {/* Order Items */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <ShoppingBag size={18} />
                            Order Items ({order.items?.length || 0})
                        </h3>
                        <div className={styles.itemsList}>
                            {order.items?.map((item: any, idx: number) => (
                                <div key={item._id || idx} className={styles.orderItem}>
                                    <div className={styles.itemImage}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} />
                                        ) : (
                                            <div className={styles.itemPlaceholder}>
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <div className={styles.itemName}>{item.name}</div>
                                        <div className={styles.itemMeta}>
                                            {item.size && (
                                                <span className={styles.itemVariant}>Size: {item.size}</span>
                                            )}
                                            {item.color && (
                                                <span className={styles.itemVariant}>Color: {item.color}</span>
                                            )}
                                            <span>Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className={styles.itemPrice}>
                                        <div className={styles.itemUnitPrice}>${item.price?.toFixed(2)} each</div>
                                        <div className={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Subtotal</span>
                                <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Shipping</span>
                                <span className={styles.summaryValue}>
                                    {order.shippingCost ? `$${order.shippingCost.toFixed(2)}` : 'Free'}
                                </span>
                            </div>
                            {order.tax > 0 && (
                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>Tax</span>
                                    <span className={styles.summaryValue}>${order.tax.toFixed(2)}</span>
                                </div>
                            )}
                            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                <span className={styles.summaryLabel}>Total</span>
                                <span className={styles.summaryValue}>${order.totalAmount?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <User size={18} />
                            Customer Information
                        </h3>
                        <div className={styles.customerGrid}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}>Name</div>
                                <div className={styles.infoValue}>
                                    {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}>Email</div>
                                <div className={styles.infoValue}>{order.customerInfo?.email}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}>Phone</div>
                                <div className={styles.infoValue}>{order.customerInfo?.phone || 'Not provided'}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}>Payment</div>
                                <div className={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                                    {order.paymentMethod || 'Card'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <MapPin size={18} />
                            Shipping Address
                        </h3>
                        <div className={styles.addressBlock}>
                            <div className={styles.addressName}>
                                {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                            </div>
                            <div>{order.customerInfo?.address}</div>
                            {order.customerInfo?.apartment && <div>{order.customerInfo.apartment}</div>}
                            <div>
                                {order.customerInfo?.city}, {order.customerInfo?.state} {order.customerInfo?.zip}
                            </div>
                            <div>{order.customerInfo?.country || 'United States'}</div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Update Order */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Truck size={18} />
                            Update Order
                        </h3>

                        {error && (
                            <div className={styles.error}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className={styles.success}>
                                <CheckCircle size={18} />
                                {success}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Order Status</label>
                            <select 
                                className={styles.select} 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tracking Number</label>
                            <input 
                                className={styles.input}
                                type="text"
                                value={tracking} 
                                onChange={(e) => setTracking(e.target.value)}
                                placeholder="Enter tracking number"
                            />
                        </div>

                        <button 
                            className={styles.submitBtn} 
                            onClick={handleUpdate}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={18} className={styles.spinner} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Update Order
                                </>
                            )}
                        </button>
                    </div>

                    {/* Order Timeline */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Clock size={18} />
                            Order Timeline
                        </h3>
                        <div className={styles.timeline}>
                            <div className={styles.timelineItem}>
                                <div className={`${styles.timelineDot} ${styles.active}`}></div>
                                <div className={styles.timelineContent}>
                                    <div className={styles.timelineTitle}>Order Placed</div>
                                    <div className={styles.timelineDate}>{formatDate(order.createdAt)}</div>
                                </div>
                            </div>
                            {order.status !== 'pending' && order.status !== 'cancelled' && (
                                <div className={styles.timelineItem}>
                                    <div className={`${styles.timelineDot} ${styles.active}`}></div>
                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineTitle}>Processing</div>
                                        <div className={styles.timelineDate}>Order confirmed</div>
                                    </div>
                                </div>
                            )}
                            {(order.status === 'shipped' || order.status === 'delivered') && (
                                <div className={styles.timelineItem}>
                                    <div className={`${styles.timelineDot} ${styles.active}`}></div>
                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineTitle}>Shipped</div>
                                        <div className={styles.timelineDate}>
                                            {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'In transit'}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {order.status === 'delivered' && (
                                <div className={styles.timelineItem}>
                                    <div className={`${styles.timelineDot} ${styles.active}`}></div>
                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineTitle}>Delivered</div>
                                        <div className={styles.timelineDate}>Package delivered</div>
                                    </div>
                                </div>
                            )}
                            {order.status === 'cancelled' && (
                                <div className={styles.timelineItem}>
                                    <div className={`${styles.timelineDot}`} style={{ background: '#ef4444' }}></div>
                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineTitle} style={{ color: '#dc2626' }}>Cancelled</div>
                                        <div className={styles.timelineDate}>Order was cancelled</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <CreditCard size={18} />
                            Payment Details
                        </h3>
                        <div className={styles.infoItem} style={{ marginBottom: '0.75rem' }}>
                            <div className={styles.infoLabel}>Method</div>
                            <div className={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                                {order.paymentMethod || 'Credit Card'}
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>Status</div>
                            <div className={styles.infoValue}>
                                <span style={{ 
                                    color: order.paymentStatus === 'paid' ? '#059669' : '#d97706',
                                    fontWeight: 600,
                                    textTransform: 'capitalize'
                                }}>
                                    {order.paymentStatus || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
