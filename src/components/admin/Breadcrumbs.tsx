"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import styles from './Breadcrumbs.module.css';

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on the main dashboard itself
  if (pathname === '/admin' || !pathname) {
    return null;
  }

  const paths = pathname.split('/').filter(Boolean);
  // Remove "admin" from paths since we're already in the admin panel
  const adminPaths = paths.slice(1);

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/admin" className={styles.link}>
            <Home size={14} className={styles.icon} />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        {adminPaths.map((path, index) => {
          const isLast = index === adminPaths.length - 1;
          const href = `/admin/${adminPaths.slice(0, index + 1).join('/')}`;
          
          // Format the path string nicely
          let formattedPath = path.charAt(0).toUpperCase() + path.slice(1);
          if (formattedPath === 'New') formattedPath = 'Create New';
          if (path.length === 24) formattedPath = 'Details'; // roughly guess ObjectId

          return (
            <React.Fragment key={path}>
              <li className={styles.separator}>
                <ChevronRight size={14} />
              </li>
              <li className={styles.item}>
                {isLast || path.length === 24 ? (
                  <span className={isLast ? styles.current : ''} aria-current={isLast ? "page" : undefined} style={!isLast ? { color: '#6b7280' } : {}}>
                    {formattedPath}
                  </span>
                ) : (
                  <Link href={href} className={styles.link}>
                    {formattedPath}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
