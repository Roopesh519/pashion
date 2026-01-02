"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await signIn('credentials', {
                redirect: false,
                email,
                password,
            } as any);

            setLoading(false);

            if (res && (res as any).error) {
                setError((res as any).error as string);
                return;
            }

            // Successful login: redirect to home or account page
            router.push('/');
        } catch (err: any) {
            setLoading(false);
            setError(err?.message || 'An unexpected error occurred');
        }
    };

    return (
        <div className={styles.page}>
            <Container className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to access your account</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.labelRow}>
                                <label htmlFor="password" className={styles.label}>Password</label>
                                <Link href="/forgot-password" className={styles.forgotLink}>Forgot?</Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                className={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <Button type="submit" fullWidth size="lg" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
                        {error && <p className={styles.error} role="alert">{error}</p>}
                    </form>

                    <p className={styles.footer}>
                        Don&apos;t have an account? <Link href="/register" className={styles.link}>Sign up</Link>
                    </p>
                </div>
            </Container>
        </div>
    );
}
