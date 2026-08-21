"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, ShoppingBag, Store, Menu, X, FolderTree } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import { startProgress } from '@/components/admin/NavProgress';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package, exact: false },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree, exact: false },
  { href: '/admin/customers', label: 'Customers', icon: Users, exact: false },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, exact: false },
];

export default function Sidebar() {
  const pathname = usePathname() || '';
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="brand-icon" style={{ width: 32, height: 32, background: 'transparent' }}>
            <img src="/brand/Urban.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{siteConfig.name}</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay */}
      <div 
        className={`admin-overlay ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="admin-brand">
        <span className="brand-icon" style={{ background: 'transparent' }}>
          <img src="/brand/Urban.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </span>
        <span>{siteConfig.name} Admin</span>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsOpen(false)} 
          style={{ marginLeft: 'auto', color: 'white' }}
        >
          <X size={20} />
        </button>
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
    </>
  );
}
