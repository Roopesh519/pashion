"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import styles from '../login/page.module.css'; // Reusing login styles

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
            });

            const data = await res.json();
            setLoading(false);

            if (!res.ok) {
                setError(data?.error || 'Registration failed');
                return;
            }

            // Auto sign-in after successful registration
            const signInResult = await signIn('credentials', { redirect: false, email: formData.email, password: formData.password } as any);

            if (signInResult && (signInResult as any).error) {
                // Signed up but auto sign-in failed; show message and redirect to login
                setError('Account created. Please sign in.');
                router.push('/login');
                return;
            }

            // Redirect to home or account page
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
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join Pashion for exclusive drops</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="name" className={styles.label}>Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className={styles.input}
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={styles.input}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className={styles.input}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                className={styles.input}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <Button type="submit" fullWidth size="lg" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
                        {error && <p className={styles.error} role="alert">{error}</p>}
                    </form>

                    <p className={styles.footer}>
                        Already have an account? <Link href="/login" className={styles.link}>Sign in</Link>
                    </p>
                </div>
            </Container>
        </div>
    );
}
