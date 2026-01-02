import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, Users, ShoppingCart } from 'lucide-react';
import './admin.css';

export const metadata = {
  title: 'Admin - Pashion',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-icon">P</span>
          Pashion Admin
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="nav-item">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/products" className="nav-item">
            <Package size={20} />
            <span>Products</span>
          </Link>
          <Link href="/admin/customers" className="nav-item">
            <Users size={20} />
            <span>Customers</span>
          </Link>
          <Link href="/admin/orders" className="nav-item">
            <ShoppingCart size={20} />
            <span>Orders</span>
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" className="nav-item back-to-store">
            ← Back to Store
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Admin</h1>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
