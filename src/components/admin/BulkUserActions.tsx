"use client";

import React, { useState } from 'react';

async function changeRole(ids: string[], role: string) {
  const results: { id: string; ok: boolean }[] = [];
  for (const id of ids) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      results.push({ id, ok: res.ok });
    } catch (e) {
      results.push({ id, ok: false });
    }
  }
  return results;
}

export default function BulkUserActions() {
  const [working, setWorking] = useState(false);

  const getSelected = () => {
    const checked = Array.from(document.querySelectorAll<HTMLInputElement>('.user-select:checked'));
    return checked.map((c) => c.value);
  };

  const applyRole = async (role: string) => {
    const ids = getSelected();
    if (ids.length === 0) return alert('Select at least one user');
    if (!confirm(`Change role of ${ids.length} users to '${role}'?`)) return;
    setWorking(true);
    await changeRole(ids, role);
    setWorking(false);
    // reload to reflect changes
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button className="actionBtn" onClick={() => applyRole('admin')} disabled={working}>
        Make Admin
      </button>
      <button className="actionBtn" onClick={() => applyRole('user')} disabled={working}>
        Make Customer
      </button>
      {working && <span style={{ color: '#64748b' }}>Applying...</span>}
    </div>
  );
}
