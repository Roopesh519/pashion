"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AdminOrderDetail() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [tracking, setTracking] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/orders?id=${params.id}`);
      if (!res.ok) {
        setError('Failed to load order');
        setLoading(false);
        return;
      }
      const data = await res.json();
      const ord = Array.isArray(data) ? data[0] : data;
      setOrder(ord);
      setStatus(ord?.status || 'pending');
      setTracking(ord?.trackingNumber || '');
      setLoading(false);
    }
    load();
  }, [params.id]);

  const handleUpdate = async () => {
    setError(null);
    const res = await fetch(`/api/admin/orders/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, trackingNumber: tracking }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'Failed to update order');
      return;
    }
    router.refresh();
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div>
      <h2>Order {order._id}</h2>
      <p><strong>Customer:</strong> {order.customerInfo?.email}</p>
      <p><strong>Total:</strong> ${order.totalAmount?.toFixed?.(2) ?? order.totalAmount}</p>

      <h3>Items</h3>
      <ul>
        {order.items?.map((it: any) => (
          <li key={it._id}>{it.name} x{it.quantity} — ${it.price}</li>
        ))}
      </ul>

      <div style={{ marginTop: 12 }}>
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">pending</option>
          <option value="processing">processing</option>
          <option value="shipped">shipped</option>
          <option value="delivered">delivered</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>Tracking Number</label>
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: 12 }}>
        <button onClick={handleUpdate}>Update Order</button>
      </div>
    </div>
  );
}
