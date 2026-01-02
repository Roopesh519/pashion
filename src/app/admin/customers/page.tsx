import React from 'react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export default async function AdminCustomersPage() {
  await dbConnect();
  const users = await User.find().select('name email role createdAt').sort({ createdAt: -1 }).lean();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Customers</h2>
      </div>

      <div style={{ marginTop: '1rem' }}>
        {users.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Joined</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id}>
                  <td style={{ padding: 8 }}>{u.name}</td>
                  <td style={{ padding: 8 }}>{u.email}</td>
                  <td style={{ padding: 8 }}>{u.role}</td>
                  <td style={{ padding: 8 }}>{new Date(u.createdAt).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>
                    <Link href={`/admin/customers/${u._id}/edit`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
