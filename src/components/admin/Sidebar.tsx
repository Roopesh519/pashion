"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/orders', label: 'Orders' },
];

export default function Sidebar() {
  const pathname = usePathname() || '';

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <span className="brand-icon">P</span>
        <span>Pashion Admin</span>
      </div>

      <nav className="admin-nav">
        <ul>
          {nav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link className={`nav-item ${isActive ? 'active' : ''}`} href={item.href}>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        <a className="back-to-store" href="/">Back to Store</a>
      </div>
    </aside>
  );
}
