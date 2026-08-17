'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from '../../app/shop/page.module.css';

const OPTIONS = [
    { value: 'newest', label: 'Sort by: Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
];

export default function SortSelect({ current }: { current?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', e.target.value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <select className={styles.sortSelect} value={current || 'newest'} onChange={handleChange}>
            {OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}
