"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', price: '', images: '', category: '', slug: '', stock: '0', sizes: '', colors: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
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
        // prefer uploaded images, fallback to comma-separated URLs
        images: (uploadedImages.length > 0 ? uploadedImages : form.images.split(',').map(s => s.trim()).filter(Boolean)),
        category: form.category,
        sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean).map((c) => ({ name: c, value: c })) : [],
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
          <label>Upload Images (select multiple)</label><br />
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {uploadedImages.map((src, i) => (
              <img key={i} src={src} alt={`preview-${i}`} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Or images (comma separated URLs)</label><br />
            <input name="images" value={form.images} onChange={handleChange} />
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Category</label><br />
          <input name="category" value={form.category} onChange={handleChange} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Sizes (comma separated)</label><br />
            <input name="sizes" value={(form as any).sizes} onChange={handleChange} placeholder="S, M, L, XL" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Colors (comma separated)</label><br />
            <input name="colors" value={(form as any).colors} onChange={handleChange} placeholder="Red, Blue, Black" />
          </div>
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
