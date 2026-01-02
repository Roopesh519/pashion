import React from 'react';
import Link from 'next/link';
import { Users, UserCheck, UserPlus, Shield, Search, Pencil } from 'lucide-react';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import styles from '../shared/listing.module.css';

type Props = { searchParams?: { [key: string]: string | string[] | undefined } };

export default async function AdminCustomersPage({ searchParams }: Props) {
  await dbConnect();
  const page = Number(searchParams?.page || 1);
  const limit = Math.min(Number(searchParams?.limit || 20), 100);
  const q = (searchParams?.q as string) || '';

  const filter: any = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
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
          <form action="/admin/customers" method="get" style={{ display: 'flex', gap: '0.5rem' }}>
            <div className={styles.searchBox}>
              <Search size={18} />
              <input 
                name="q" 
                placeholder="Search customers..." 
                defaultValue={q} 
                className={styles.searchInput}
              />
            </div>
            <button type="submit" className={styles.toolbarBtn}>
              Search
            </button>
          </form>
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
                  <td className={styles.cellPrimary}>{u.name}</td>
                  <td className={styles.cellMuted}>{u.email}</td>
                  <td>
                    <span className={`${styles.badge} ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className={styles.cellMuted}>{formatDate(u.createdAt)}</td>
                  <td>
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
                href={`/admin/customers?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} 
                className={styles.pageBtn}
              >
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link 
                href={`/admin/customers?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} 
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
