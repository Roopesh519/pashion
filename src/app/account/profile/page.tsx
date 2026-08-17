"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, User } from 'lucide-react';
import Container from '@/components/ui/Container';
import { useToast } from '@/components/ui/ToastContainer';
import styles from './page.module.css';

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('US');

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (!session?.user?.id) return;
        fetch(`/api/user/${(session.user as any).id}/profile`)
            .then(r => r.json())
            .then(d => {
                const u = d.user;
                setName(u.name || '');
                setPhone(u.phone || '');
                setStreet(u.address?.street || '');
                setCity(u.address?.city || '');
                setState(u.address?.state || '');
                setZip(u.address?.zip || '');
                setCountry(u.address?.country || 'US');
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [session?.user?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/user/${(session!.user as any).id}/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    address: { street, city, state, zip, country },
                }),
            });
            if (!res.ok) {
                const d = await res.json();
                showToast('error', d.error || 'Failed to save');
                return;
            }
            await update({ name });
            showToast('success', 'Profile updated');
        } catch {
            showToast('error', 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className={styles.page}>
                <Container>
                    <div className={styles.loadingState}>
                        <Loader2 size={28} className={styles.spinner} /> Loading profile...
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
                    <h1 className={styles.title}>My Profile</h1>
                    <p className={styles.subtitle}>Manage your personal information</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Account Info (read-only) */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}><User size={16} /> Account</h3>
                        <div className={styles.readonlyField}>
                            <label className={styles.label}>Email</label>
                            <p className={styles.readonlyValue}>{session?.user?.email}</p>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Personal Information</h3>
                        <div className={styles.field}>
                            <label className={styles.label}>Full Name</label>
                            <input
                                className={styles.input}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Your name"
                                maxLength={60}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Phone</label>
                            <input
                                className={styles.input}
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                maxLength={20}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Shipping Address</h3>
                        <div className={styles.field}>
                            <label className={styles.label}>Street Address</label>
                            <input
                                className={styles.input}
                                value={street}
                                onChange={e => setStreet(e.target.value)}
                                placeholder="123 Main St"
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>City</label>
                                <input className={styles.input} value={city} onChange={e => setCity(e.target.value)} placeholder="New York" />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>State</label>
                                <input className={styles.input} value={state} onChange={e => setState(e.target.value)} placeholder="NY" maxLength={100} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>ZIP Code</label>
                                <input className={styles.input} value={zip} onChange={e => setZip(e.target.value)} placeholder="10001" maxLength={20} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Country</label>
                                <input className={styles.input} value={country} onChange={e => setCountry(e.target.value)} placeholder="US" maxLength={2} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className={styles.saveBtn}>
                        {saving ? <><Loader2 size={16} className={styles.spinner} /> Saving...</> : <><Save size={16} /> Save Changes</>}
                    </button>
                </form>
            </Container>
        </div>
    );
}
