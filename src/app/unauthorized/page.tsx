'use client';

import Link from 'next/link';
import { ShieldX, Home, LogIn, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function UnauthorizedPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <ShieldX size={64} strokeWidth={1.5} />
        </div>
        
        <h1 className={styles.title}>Access Denied</h1>
        
        <p className={styles.message}>
          You don&apos;t have permission to access this page. 
          This area is restricted to administrators only.
        </p>
        
        <div className={styles.info}>
          <p>If you believe this is an error, please:</p>
          <ul>
            <li>Make sure you&apos;re logged in with the correct account</li>
            <li>Contact an administrator if you need access</li>
            <li>Check that your account has the required permissions</li>
          </ul>
        </div>
        
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>
            <Home size={18} />
            Go to Homepage
          </Link>
          
          <Link href="/login" className={styles.secondaryBtn}>
            <LogIn size={18} />
            Sign In
          </Link>
        </div>
        
        <button 
          onClick={() => window.history.back()} 
          className={styles.backLink}
        >
          <ArrowLeft size={16} />
          Go back to previous page
        </button>
      </div>
    </div>
  );
}

