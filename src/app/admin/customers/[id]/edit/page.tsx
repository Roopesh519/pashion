"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditCustomerPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('user');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/user/${params.id}/profile`);
      if (!res.ok) {
        setError('Failed to load user');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUser(data);
      setRole(data.role || 'user');
      setLoading(false);
    }
    load();
  }, [params.id]);

  const handleSave = async () => {
    setError(null);
    const res = await fetch(`/api/admin/users/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'Failed to update user');
      return;
    }
    router.push('/admin/customers');
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div>
      <h2>Edit Customer</h2>
      <p><strong>{user.name}</strong> — {user.email}</p>
      <div style={{ marginTop: 8 }}>
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginTop: 12 }}>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
