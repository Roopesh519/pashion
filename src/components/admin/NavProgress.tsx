'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

let globalStart: (() => void) | null = null;
let globalDone: (() => void) | null = null;

export function startProgress() { globalStart?.(); }
export function doneProgress() { globalDone?.(); }

export default function NavProgress() {
    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        globalStart = () => {
            setVisible(true);
            setWidth(20);
            const t1 = setTimeout(() => setWidth(60), 100);
            const t2 = setTimeout(() => setWidth(80), 500);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        };
        globalDone = () => {
            setWidth(100);
            setTimeout(() => { setVisible(false); setWidth(0); }, 300);
        };
    }, []);

    // auto-complete on route change
    useEffect(() => {
        globalDone?.();
    }, [pathname]);

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '3px',
            width: `${width}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            transition: 'width 0.3s ease',
            zIndex: 99999,
            borderRadius: '0 2px 2px 0',
        }} />
    );
}
