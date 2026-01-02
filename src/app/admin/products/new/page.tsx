"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ImagePlus, Loader2, Lightbulb, X, Palette, Ruler } from 'lucide-react';
import styles from './page.module.css';

const CATEGORY_OPTIONS = ['Hoodie', 'T-Shirt', 'Pants', 'Outerwear', 'Accessories'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Gray', hex: '#6b7280' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Beige', hex: '#d4b896' },
];

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [slug, setSlug] = useState('');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([]);
  const [customColor, setCustomColor] = useState('');

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imagesText, setImagesText] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  };

  const toggleColor = (color: { name: string; hex: string }) => {
    setSelectedColors((prev) => 
      prev.some(c => c.name === color.name) 
        ? prev.filter((c) => c.name !== color.name) 
        : [...prev, color]
    );
  };

  const addCustomColor = () => {
    const trimmed = customColor.trim();
    if (!trimmed) return;
    if (!selectedColors.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedColors((p) => [...p, { name: trimmed, hex: '#888888' }]);
    }
    setCustomColor('');
  };

  const removeColor = (colorName: string) => {
    setSelectedColors(prev => prev.filter(c => c.name !== colorName));
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

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const images = uploadedImages.length > 0 ? uploadedImages : imagesText.split(',').map((s) => s.trim()).filter(Boolean);
      const colorsPayload = selectedColors.map((c) => ({
        name: c.name,
        value: c.hex,
      }));

      const payload = {
        name,
        description,
        price: parseFloat(price || '0'),
        images,
        category,
        sizes: selectedSizes,
        colors: colorsPayload,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        stock: parseInt(stock || '0', 10),
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
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Product</h1>
        <p className={styles.subtitle}>Add a new product to your store catalog</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          {/* Basic Info Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Package size={18} />
              Basic Information
            </h3>

            <div className={styles.field}>
              <label className={styles.label}>Product Name *</label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Cotton Hoodie"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description *</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product in detail..."
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={styles.input}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <select
                  className={styles.select}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>URL Slug</label>
                <input
                  type="text"
                  className={styles.input}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-from-name"
                />
              </div>
            </div>
          </div>

          {/* Sizes Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Ruler size={18} />
              Available Sizes
            </h3>
            <div className={styles.sizeGrid}>
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.sizeBtn} ${selectedSizes.includes(s) ? styles.active : ''}`}
                  onClick={() => toggleSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Palette size={18} />
              Available Colors
            </h3>
            <div className={styles.colorGrid}>
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`${styles.colorBtn} ${selectedColors.some(sc => sc.name === c.name) ? styles.active : ''}`}
                  onClick={() => toggleColor(c)}
                >
                  <span className={styles.colorSwatch} style={{ backgroundColor: c.hex }} />
                  {c.name}
                </button>
              ))}
            </div>
            <div className={styles.customColorRow}>
              <input
                type="text"
                className={styles.customColorInput}
                placeholder="Add custom color..."
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
              />
              <button type="button" className={styles.addColorBtn} onClick={addCustomColor}>
                Add
              </button>
            </div>
            {selectedColors.length > 0 && (
              <div className={styles.selectedColors}>
                {selectedColors.map((c) => (
                  <span key={c.name} className={styles.colorTag}>
                    <span className={styles.colorSwatch} style={{ backgroundColor: c.hex, width: 14, height: 14 }} />
                    {c.name}
                    <button type="button" onClick={() => removeColor(c.name)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error & Actions */}
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <Link href="/admin/products">
              <button type="button" className={styles.cancelBtn}>Cancel</button>
            </Link>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  Creating...
                </>
              ) : (
                <>
                  <Package size={18} />
                  Create Product
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          {/* Image Upload Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <ImagePlus size={18} />
              Product Images
            </h3>

            <div 
              className={styles.uploadArea}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.uploadIcon}>
                <ImagePlus size={32} />
              </div>
              <p className={styles.uploadText}>Click to upload images</p>
              <p className={styles.uploadHint}>PNG, JPG up to 5MB each</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className={styles.fileInput}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {uploadedImages.length > 0 && (
              <div className={styles.imageGrid}>
                {uploadedImages.map((src, i) => (
                  <div key={i} className={styles.imagePreview}>
                    <img src={src} alt={`preview-${i}`} />
                    <button
                      type="button"
                      className={styles.removeImage}
                      onClick={() => removeImage(i)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.urlSection}>
              <label className={styles.urlLabel}>Or paste image URLs (comma separated)</label>
              <input
                type="text"
                className={styles.input}
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                placeholder="https://example.com/image1.jpg, ..."
              />
            </div>
          </div>

          {/* Tips Card */}
          <div className={styles.tipsCard}>
            <h4 className={styles.tipsTitle}>
              <Lightbulb size={16} />
              Quick Tips
            </h4>
            <ul className={styles.tipsList}>
              <li>Use descriptive product names</li>
              <li>Add at least one high-quality image</li>
              <li>Set accurate stock levels</li>
              <li>Choose all available sizes</li>
              <li>Recommended image: 800×800px</li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}
