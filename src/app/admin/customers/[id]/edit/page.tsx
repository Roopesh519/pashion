"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, 
    User, 
    Shield, 
    Mail, 
    Calendar,
    AlertTriangle,
    AlertCircle,
    Loader2,
    Save,
    UserCircle,
    Crown
} from 'lucide-react';
import styles from './page.module.css';

export default function EditCustomerPage() {
    const params = useParams() as { id: string };
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState('user');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/user/${params.id}/profile`);
                if (!res.ok) {
                    setError('Failed to load user');
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                // API returns { user: ... } so extract the user object
                const userData = data.user || data;
                setUser(userData);
                setRole(userData.role || 'user');
            } catch (err) {
                setError('Failed to load user');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    const handleSave = async () => {
        setError(null);
        setSaving(true);
        
        try {
            const res = await fetch(`/api/admin/users/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            });
            
            if (!res.ok) {
                const d = await res.json();
                setError(d.error || 'Failed to update user');
                return;
            }
            
            router.push('/admin/customers');
        } catch (err) {
            setError('Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (date: string) => {
        if (!date) return 'Unknown';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <Loader2 size={40} className={styles.spinner} />
                    <p className={styles.loadingText}>Loading customer details...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.page}>
                <div className={styles.notFound}>
                    <User size={64} className={styles.notFoundIcon} />
                    <h2 className={styles.notFoundTitle}>Customer Not Found</h2>
                    <p className={styles.notFoundText}>The customer you're looking for doesn't exist or has been removed.</p>
                    <Link href="/admin/customers" className={styles.backLink}>
                        <ArrowLeft size={18} />
                        Back to Customers
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/admin/customers')}>
                    <ArrowLeft size={20} />
                </button>
                <div className={styles.headerInfo}>
                    <h1>Edit Customer</h1>
                    <p>Update customer role and permissions</p>
                </div>
            </div>

            {/* User Profile Card */}
            <div className={styles.userProfile}>
                <div className={styles.avatar}>
                    {getInitials(user.name)}
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.userName}>{user.name || 'Unknown User'}</div>
                    <div className={styles.userEmail}>
                        <Mail size={14} />
                        {user.email}
                    </div>
                    <div className={styles.userMeta}>
                        <span className={styles.metaItem}>
                            <Calendar size={12} />
                            Joined {formatDate(user.createdAt)}
                        </span>
                        <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
                            {user.role === 'admin' ? <Crown size={12} /> : <User size={12} />}
                            {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                    <Shield size={18} />
                    Role & Permissions
                </h3>

                {error && (
                    <div className={styles.error}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Assign Role
                        <span className={styles.labelHint}>Choose the user's access level</span>
                    </label>
                    
                    <div className={styles.roleOptions}>
                        <div 
                            className={`${styles.roleOption} ${role === 'user' ? styles.active : ''}`}
                            onClick={() => setRole('user')}
                        >
                            <div className={styles.roleOptionIcon}>
                                <UserCircle size={20} />
                            </div>
                            <div className={styles.roleOptionTitle}>User</div>
                            <div className={styles.roleOptionDesc}>Standard customer access</div>
                        </div>
                        
                        <div 
                            className={`${styles.roleOption} ${role === 'admin' ? styles.active : ''}`}
                            onClick={() => setRole('admin')}
                        >
                            <div className={styles.roleOptionIcon}>
                                <Crown size={20} />
                            </div>
                            <div className={styles.roleOptionTitle}>Admin</div>
                            <div className={styles.roleOptionDesc}>Full admin panel access</div>
                        </div>
                    </div>

                    {role === 'admin' && user.role !== 'admin' && (
                        <div className={styles.warningBox}>
                            <AlertTriangle size={18} className={styles.warningIcon} />
                            <div className={styles.warningText}>
                                <strong>Warning:</strong> Granting admin access will allow this user to manage products, orders, and other customers. Only assign admin role to trusted team members.
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <button 
                        className={styles.cancelBtn}
                        onClick={() => router.push('/admin/customers')}
                    >
                        Cancel
                    </button>
                    <button 
                        className={styles.submitBtn} 
                        onClick={handleSave}
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
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
