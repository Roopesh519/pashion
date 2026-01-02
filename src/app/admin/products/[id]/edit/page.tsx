"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/products/${params.id}`);
      if (!res.ok) {
        setError('Failed to load product');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setForm({
        name: data.name || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        images: (data.images || []).join(', '),
        category: data.category || '',
        slug: data.slug || '',
        stock: data.stock?.toString() || '0',
      });
      setLoading(false);
    }
    load();
  }, [params.id]);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        images: form.images.split(',').map((s: string) => s.trim()).filter(Boolean),
        category: form.category,
        slug: form.slug,
        stock: parseInt(form.stock || '0', 10),
      };

      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update product');
        setLoading(false);
        return;
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Edit Product</h2>
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
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
