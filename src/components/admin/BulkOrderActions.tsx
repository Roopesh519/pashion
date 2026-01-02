"use client";

import React, { useState } from 'react';

async function updateOrderStatus(ids: string[], status: string) {
  const results: { id: string; ok: boolean }[] = [];
  for (const id of ids) {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      results.push({ id, ok: res.ok });
    } catch (e) {
      results.push({ id, ok: false });
    }
  }
  return results;
}

export default function BulkOrderActions({ getSelected }: { getSelected: () => string[] }) {
  const [working, setWorking] = useState(false);

  const applyStatus = async (status: string) => {
    const ids = getSelected();
    if (ids.length === 0) return alert('Select at least one order');
    if (!confirm(`Change status of ${ids.length} orders to '${status}'?`)) return;
    setWorking(true);
    await updateOrderStatus(ids, status);
    setWorking(false);
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button className="actionBtn" onClick={() => applyStatus('processing')} disabled={working}>Mark Processing</button>
      <button className="actionBtn" onClick={() => applyStatus('shipped')} disabled={working}>Mark Shipped</button>
      <button className="actionBtn" onClick={() => applyStatus('delivered')} disabled={working}>Mark Delivered</button>
      {working && <span style={{ color: '#64748b' }}>Applying...</span>}
    </div>
  );
}
