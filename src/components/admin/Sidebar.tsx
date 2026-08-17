"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, ShoppingBag, Store } from 'lucide-react';
import { startProgress } from '@/components/admin/NavProgress';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package, exact: false },
  { href: '/admin/customers', label: 'Customers', icon: Users, exact: false },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, exact: false },
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
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  href={item.href}
                  onClick={() => !isActive && startProgress()}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        <Link className="nav-item back-to-store" href="/">
          <Store size={18} />
          <span>Back to Store</span>
        </Link>
      </div>
    </aside>
  );
}
