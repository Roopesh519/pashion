"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', price: '', images: '', category: '', slug: '', stock: '0' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        category: form.category,
        slug: form.slug,
        stock: parseInt(form.stock || '0', 10),
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create product');
        setLoading(false);
        return;
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Product</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Name</label><br />
          <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Description</label><br />
          <textarea name="description" value={form.description} onChange={handleChange} required style={{ width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Price</label><br />
            <input name="price" value={form.price} onChange={handleChange} required />
          </div>
          <div style={{ width: 160 }}>
            <label>Stock</label><br />
            <input name="stock" value={form.stock} onChange={handleChange} required />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Images (comma separated URLs)</label><br />
          <input name="images" value={form.images} onChange={handleChange} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Category</label><br />
          <input name="category" value={form.category} onChange={handleChange} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Slug</label><br />
          <input name="slug" value={form.slug} onChange={handleChange} />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Product'}</button>
        </div>
      </form>
    </div>
  );
}
