"use client";

import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastContainer';
import styles from './WishlistButton.module.css';

interface Props {
    productId: string;
    slug: string;
}

export default function WishlistButton({ productId, slug }: Props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { showToast } = useToast();
    const [wishlisted, setWishlisted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status !== 'authenticated' || !session?.user?.id) return;
        fetch(`/api/user/${session.user.id}/wishlist`)
            .then(r => r.json())
            .then(data => {
                const list: any[] = data.wishlist || [];
                setWishlisted(list.some(item => item._id?.toString() === productId));
            })
            .catch(() => {});
    }, [status, session?.user?.id, productId]);

    const toggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (status !== 'authenticated' || !session?.user?.id) {
            showToast('info', 'Please sign in to save items');
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            const base = `/api/user/${session.user.id}/wishlist`;
            const res = await fetch(
                wishlisted ? `${base}?productId=${encodeURIComponent(productId)}` : base,
                {
                    method: wishlisted ? 'DELETE' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    ...(!wishlisted && { body: JSON.stringify({ productId }) }),
                }
            );
            if (!res.ok) throw new Error();
            setWishlisted(w => !w);
            showToast('success', wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
        } catch {
            showToast('error', 'Unable to update wishlist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`${styles.btn} ${wishlisted ? styles.active : ''}`}
            onClick={toggle}
            disabled={loading}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
    );
}
