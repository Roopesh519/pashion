import React from 'react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import styles from '../products/page.module.css';
import SelectAll from '@/components/admin/SelectAll';
import BulkUserActions from '@/components/admin/BulkUserActions';

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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>List of registered customers</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <form action="/admin/customers" method="get" style={{ display: 'flex', gap: 8 }}>
            <input name="q" placeholder="Search customers..." defaultValue={q} style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid var(--border)' }} />
            <button className="actionBtn" type="submit">Search</button>
          </form>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <BulkUserActions />
      </div>

      <div className={styles.tableContainer} style={{ marginTop: '1rem' }}>
        {users.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No customers found.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 48 }}><SelectAll /></th>
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
                  <td><input className="user-select" type="checkbox" value={u._id} /></td>
                  <td className={styles.productName}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                  <td>
                    <Link href={`/admin/customers/${u._id}/edit`}>
                      <button className={styles.actionBtn}>Edit</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <div style={{ alignSelf: 'center', color: 'var(--muted)' }}>Page {page} of {totalPages}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {page > 1 && (
            <Link href={`/admin/customers?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className="actionBtn">Prev</Link>
          )}
          {page < totalPages && (
            <Link href={`/admin/customers?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className="actionBtn">Next</Link>
          )}
        </div>
      </div>
    </div>
  );
}
