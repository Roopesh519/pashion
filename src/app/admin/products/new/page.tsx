"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ImagePlus, Loader2, Lightbulb, X, Palette, Ruler, Tag, AlertCircle } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { currencySymbol } from '@/lib/currency';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from './page.module.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [slug, setSlug] = useState('');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([]);
  const [customColor, setCustomColor] = useState('');
  const [badge, setBadge] = useState('');

  const { images: uploadedImages, uploading, uploadError, uploadFiles, removeImage } = useImageUpload();
  const [imagesText, setImagesText] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load categories');
        }

        const items = data.categories || [];
        setCategories(items);
        setCategory((current) => current || items[0]?.name || '');
      } catch (err: any) {
        setError(err?.message || 'Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  const handleSlugChange = (val: string) => {
    setSlug(val);
    if (val && !SLUG_RE.test(val)) {
      setSlugError('Only lowercase letters, numbers and hyphens (e.g. my-product)');
    } else {
      setSlugError(null);
    }
  };

  const hasImages = uploadedImages.length > 0 || imagesText.trim().length > 0;
  const rawDescription = description.replace(/<[^>]*>?/gm, '').trim();
  
  const canSubmit =
    name.trim().length >= 3 &&
    name.trim().length <= 100 &&
    rawDescription.length >= 10 &&
    price &&
    parseFloat(price) >= 0.01 &&
    stock &&
    parseInt(stock, 10) >= 0 &&
    category.trim().length > 0 &&
    hasImages &&
    !slugError &&
    !uploading &&
    !loading;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const urlImages = imagesText.split(',').map(s => s.trim()).filter(Boolean);
      const images = [...uploadedImages, ...urlImages];
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
        badge: badge.trim() || undefined,
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
                minLength={3}
                maxLength={100}
                required
              />
              {name && (name.trim().length < 3 || name.trim().length > 100) && (
                <span className={styles.fieldError}>Name must be between 3 and 100 characters.</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description *</label>
              <div style={{ background: '#fff', borderRadius: '0.375rem' }}>
                <ReactQuill 
                  theme="snow" 
                  value={description} 
                  onChange={setDescription} 
                  placeholder="Describe your product in detail..."
                />
              </div>
              {rawDescription.length > 0 && rawDescription.length < 10 && (
                <span className={styles.fieldError}>Description must be at least 10 characters long.</span>
              )}
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Price ({currencySymbol}) *</label>
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
                {stock && parseInt(stock, 10) < 0 && (
                  <span className={styles.fieldError}>Stock cannot be negative.</span>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <select
                  className={styles.select}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={categoriesLoading || categories.length === 0}
                >
                  {categories.length === 0 ? (
                    <option value="">Create a category first</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))
                  )}
                </select>
                {!categoriesLoading && categories.length === 0 && (
                  <span className={styles.hint}>
                    No categories found. Create one in <Link href="/admin/categories">Categories</Link> before adding products.
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>URL Slug</label>
                <input
                  type="text"
                  className={`${styles.input} ${slugError ? styles.inputError : ''}`}
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="auto-generated-from-name"
                />
                {slugError && <span className={styles.fieldError}><AlertCircle size={12} style={{display:'inline',marginRight:4}} />{slugError}</span>}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <Tag size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Product Badge
              </label>
              <input
                type="text"
                className={styles.input}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. New, Sale, Limited Edition, Best Seller"
                maxLength={30}
              />
              <span className={styles.hint}>Optional badge displayed on the product card (max 30 chars)</span>
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
            <button type="submit" disabled={!canSubmit} className={styles.submitBtn}>
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
              className={`${styles.uploadArea} ${uploading ? styles.uploadAreaDisabled : ''}`}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <div className={styles.uploadIcon}>
                <ImagePlus size={32} />
              </div>
              <p className={styles.uploadText}>Click to upload images</p>
              <p className={styles.uploadHint}>PNG, JPG, WebP up to 5MB each</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className={styles.fileInput}
                onChange={(e) => uploadFiles(e.target.files)}
              />
            </div>
            {uploading && (
              <p className={styles.uploadingIndicator}>
                <Loader2 size={14} className={styles.spinner} /> Uploading to Cloudinary...
              </p>
            )}
            {uploadError && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem' }}>{uploadError}</p>}

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
            {!hasImages && name.trim().length > 0 && (
              <p className={styles.fieldError} style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                At least 1 product image is required.
              </p>
            )}
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
