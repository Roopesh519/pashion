"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShoppingBag, User, MapPin, CreditCard, Loader2, AlertCircle, Shield, Check, Package } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

interface FormErrors {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
}

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const shippingCost = cartTotal > 150 ? 0 : 15;
    const tax = Math.round(cartTotal * 0.08 * 100) / 100;
    const total = cartTotal + shippingCost + tax;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

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

    // Validation functions
    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return undefined;
    };

    const validateRequired = (value: string, fieldName: string): string | undefined => {
        if (!value.trim()) return `${fieldName} is required`;
        return undefined;
    };

    const validatePhone = (phone: string): string | undefined => {
        if (!phone.trim()) return undefined; // Optional field
        const phoneRegex = /^[\d\s\-+()]{10,}$/;
        if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
        return undefined;
    };

    const validateZip = (zip: string): string | undefined => {
        if (!zip.trim()) return 'ZIP code is required';
        if (zip.length < 3) return 'Please enter a valid ZIP code';
        return undefined;
    };

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case 'email':
                return validateEmail(value);
            case 'firstName':
                return validateRequired(value, 'First name');
            case 'lastName':
                return validateRequired(value, 'Last name');
            case 'phone':
                return validatePhone(value);
            case 'address':
                return validateRequired(value, 'Address');
            case 'city':
                return validateRequired(value, 'City');
            case 'zip':
                return validateZip(value);
            default:
                return undefined;
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        newErrors.email = validateEmail(formData.email);
        newErrors.firstName = validateRequired(formData.firstName, 'First name');
        newErrors.lastName = validateRequired(formData.lastName, 'Last name');
        newErrors.phone = validatePhone(formData.phone);
        newErrors.address = validateRequired(formData.address, 'Address');
        newErrors.city = validateRequired(formData.city, 'City');
        newErrors.zip = validateZip(formData.zip);

        // Filter out undefined values
        const filteredErrors: FormErrors = {};
        Object.entries(newErrors).forEach(([key, value]) => {
            if (value) filteredErrors[key as keyof FormErrors] = value;
        });

        setErrors(filteredErrors);
        return Object.keys(filteredErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear error on change if field was touched
        if (touched[name]) {
            const fieldError = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: fieldError }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const fieldError = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: fieldError }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Mark all fields as touched
        const allTouched: Record<string, boolean> = {};
        Object.keys(formData).forEach(key => allTouched[key] = true);
        setTouched(allTouched);

        if (!validateForm()) {
            setError('Please fix the errors below');
            return;
        }

        setLoading(true);

        try {
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
                paymentMethod: 'credit_card',
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
                    <ShoppingBag size={64} style={{ color: '#d1d5db', marginBottom: '1.5rem' }} />
                    <h1>Your cart is empty</h1>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--muted)' }}>Add items to your cart before checking out.</p>
                    <Link href="/shop"><Button>Continue Shopping</Button></Link>
                </Container>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Container>
                <div className={styles.layout}>
                    <div className={styles.main}>
                        <div className={styles.header}>
                            <div className={styles.headerIcon}>
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h1 className={styles.title}>Checkout</h1>
                                <p className={styles.subtitle}>Complete your order securely</p>
                            </div>
                        </div>

                        {error && (
                            <div className={styles.errorAlert}>
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Contact Information */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionIcon}>
                                        <User size={18} />
                                    </div>
                                    <h2 className={styles.sectionTitle}>Contact Information</h2>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        Email Address <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        className={`${styles.input} ${errors.email && touched.email ? styles.error : ''}`}
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.email && touched.email && (
                                        <span className={styles.fieldError}>
                                            <AlertCircle size={14} />
                                            {errors.email}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionIcon}>
                                        <MapPin size={18} />
                                    </div>
                                    <h2 className={styles.sectionTitle}>Shipping Address</h2>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>
                                            First Name <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="John"
                                            className={`${styles.input} ${errors.firstName && touched.firstName ? styles.error : ''}`}
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {errors.firstName && touched.firstName && (
                                            <span className={styles.fieldError}>
                                                <AlertCircle size={14} />
                                                {errors.firstName}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>
                                            Last Name <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Doe"
                                            className={`${styles.input} ${errors.lastName && touched.lastName ? styles.error : ''}`}
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {errors.lastName && touched.lastName && (
                                            <span className={styles.fieldError}>
                                                <AlertCircle size={14} />
                                                {errors.lastName}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="+1 (555) 123-4567"
                                        className={`${styles.input} ${errors.phone && touched.phone ? styles.error : ''}`}
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.phone && touched.phone && (
                                        <span className={styles.fieldError}>
                                            <AlertCircle size={14} />
                                            {errors.phone}
                                        </span>
                                    )}
                                </div>

                                <div className={styles.field} style={{ marginTop: '20px' }}>
                                    <label className={styles.label}>
                                        Street Address <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="123 Main Street, Apt 4B"
                                        className={`${styles.input} ${errors.address && touched.address ? styles.error : ''}`}
                                        value={formData.address}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.address && touched.address && (
                                        <span className={styles.fieldError}>
                                            <AlertCircle size={14} />
                                            {errors.address}
                                        </span>
                                    )}
                                </div>

                                <div className={styles.row} style={{ marginTop: '20px' }}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>
                                            City <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="New York"
                                            className={`${styles.input} ${errors.city && touched.city ? styles.error : ''}`}
                                            value={formData.city}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {errors.city && touched.city && (
                                            <span className={styles.fieldError}>
                                                <AlertCircle size={14} />
                                                {errors.city}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>State/Province</label>
                                        <input
                                            type="text"
                                            name="state"
                                            placeholder="NY"
                                            className={styles.input}
                                            value={formData.state}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </div>
                                </div>

                                <div className={styles.row} style={{ marginTop: '20px' }}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>
                                            ZIP/Postal Code <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="zip"
                                            placeholder="10001"
                                            className={`${styles.input} ${errors.zip && touched.zip ? styles.error : ''}`}
                                            value={formData.zip}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {errors.zip && touched.zip && (
                                            <span className={styles.fieldError}>
                                                <AlertCircle size={14} />
                                                {errors.zip}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Country</label>
                                        <select
                                            name="country"
                                            className={`${styles.input} ${styles.select}`}
                                            value={formData.country}
                                            onChange={handleChange}
                                        >
                                            <option value="US">United States</option>
                                            <option value="CA">Canada</option>
                                            <option value="UK">United Kingdom</option>
                                            <option value="AU">Australia</option>
                                            <option value="IN">India</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className={styles.spinner} />
                                        Processing Order...
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        Place Order · ${total.toFixed(2)}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>
                            <Package size={20} />
                            Order Summary
                        </h2>

                        <div className={styles.summaryItems}>
                            {items.map((item) => (
                                <div key={`${item.id}-${item.size}-${item.color}`} className={styles.summaryItem}>
                                    <div className={styles.itemImage}>
                                        {item.image && <img src={item.image} alt={item.name} />}
                                        <span className={styles.itemQty}>{item.quantity}</span>
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemName}>{item.name}</div>
                                        <div className={styles.itemVariant}>
                                            {item.size}{item.color ? ` / ${item.color}` : ''}
                                        </div>
                                    </div>
                                    <div className={styles.itemPrice}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
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
                            <p className={styles.note}>
                                <Check size={14} />
                                Free shipping on orders over $150
                            </p>
                        )}

                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        <div className={styles.securityBadge}>
                            <Shield size={16} />
                            <span>Your payment information is secure and encrypted</span>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
