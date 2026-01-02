'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

export default function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
    const Icon = iconMap[type];

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            <Icon className={styles.icon} size={20} />
            <p className={styles.message}>{message}</p>
            <button
                onClick={() => onClose(id)}
                className={styles.closeBtn}
                aria-label="Close notification"
            >
                <X size={16} />
            </button>
        </div>
    );
}
