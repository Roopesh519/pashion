import React from 'react';
import Link from 'next/link';
import { Users, UserCheck, UserPlus, Shield, Search, Pencil } from 'lucide-react';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import styles from '../shared/listing.module.css';
import CustomerFilters from './CustomerFilters';

type Props = { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> };

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default async function AdminCustomersPage({ searchParams }: Props) {
  await dbConnect();
  const sp = await searchParams;
  const requestedPage = Number(sp?.page || 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const requestedLimit = Number(sp?.limit || 10);
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 20;
  const q = ((sp?.q as string) || '').slice(0, 100);
  const role = (sp?.role as string) || 'all';

  const filter: any = {};
  if (role !== 'all') {
    filter.role = role;
  }
  if (q) {
    filter.$or = [
      { name: { $regex: escapeRegExp(q), $options: 'i' } },
      { email: { $regex: escapeRegExp(q), $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Stats
  const totalUsers = await User.countDocuments({});
  const adminCount = await User.countDocuments({ role: 'admin' });
  const recentCount = await User.countDocuments({ 
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') return styles.badgePurple;
    return styles.badgeSuccess;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Users size={24} />
          </div>
          <div className={styles.headerText}>
            <h1>Customers</h1>
            <p>Manage registered customers</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <CustomerFilters q={q} role={role} />
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <Users size={22} />
          </div>
          <div className={styles.statInfo}>
            <h3>{totalUsers}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <UserPlus size={22} />
          </div>
          <div className={styles.statInfo}>
            <h3>{recentCount}</h3>
            <p>New (30 days)</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
            <Shield size={22} />
          </div>
          <div className={styles.statInfo}>
            <h3>{adminCount}</h3>
            <p>Admins</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconYellow}`}>
            <UserCheck size={22} />
          </div>
          <div className={styles.statInfo}>
            <h3>{totalUsers - adminCount}</h3>
            <p>Regular Users</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={48} />
          <p>No customers found</p>
          <span>{q ? 'Try adjusting your search' : 'Customers will appear here when they register'}</span>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id}>
                  <td data-label="Name" className={styles.cellPrimary}>{u.name}</td>
                  <td data-label="Email" className={styles.cellMuted}>{u.email}</td>
                  <td data-label="Role">
                    <span className={`${styles.badge} ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td data-label="Joined" className={styles.cellMuted}>{formatDate(u.createdAt)}</td>
                  <td data-label="Actions">
                    <Link href={`/admin/customers/${u._id}/edit`} className={styles.viewBtn}>
                      <Pencil size={14} />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {users.length > 0 && (
        <div className={styles.paginationRow}>
          <div className={styles.paginationFilters}>
            <span className={styles.pageInfo}>
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} customers
            </span>
          </div>
          <div className={styles.paginationControls}>
            <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
            {page > 1 && (
              <Link 
                href={`/admin/customers?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}${role !== 'all' ? `&role=${encodeURIComponent(role)}` : ''}`} 
                className={styles.pageBtn}
              >
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link 
                href={`/admin/customers?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}${role !== 'all' ? `&role=${encodeURIComponent(role)}` : ''}`} 
                className={styles.pageBtn}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
