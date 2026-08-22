"use client";

import React, { useEffect, useRef, useState } from 'react';
import { FolderTree, ImagePlus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { slugifyCategoryName } from '@/lib/categoryUtils';
import styles from './page.module.css';

interface CategoryItem {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    featured: boolean;
    sortOrder: number;
    productCount?: number;
}

const initialForm = {
    id: '',
    name: '',
    slug: '',
    description: '',
    image: '',
    featured: true,
    sortOrder: '0',
};

export default function AdminCategoriesPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [slugTouched, setSlugTouched] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState(initialForm);

    const isEditing = Boolean(form.id);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/categories?includeCounts=true');
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch categories');
            }
            setCategories(data.categories || []);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setForm(initialForm);
        setSlugTouched(false);
        setError('');
        setSuccess('');
    };

    const setField = (key: keyof typeof initialForm, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleNameChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            name: value,
            slug: slugTouched ? prev.slug : slugifyCategoryName(value),
        }));
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('file', files[0]);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            setField('image', data.url);
        } catch (err: any) {
            setError(err?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (category: CategoryItem) => {
        setForm({
            id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            featured: category.featured,
            sortOrder: String(category.sortOrder ?? 0),
        });
        setSlugTouched(true);
        setError('');
        setSuccess('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (category: CategoryItem) => {
        if (!confirm(`Delete category "${category.name}"?`)) return;

        setDeletingId(category._id);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`/api/categories/${category._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete category');
            }

            setCategories((prev) => prev.filter((item) => item._id !== category._id));
            if (form.id === category._id) {
                resetForm();
            }
            setSuccess('Category deleted successfully.');
        } catch (err: any) {
            setError(err?.message || 'Failed to delete category');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.name.trim() || !form.slug.trim() || !form.description.trim() || !form.image.trim()) {
            setError('Name, slug, description, and image are required.');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name: form.name.trim(),
                slug: form.slug.trim(),
                description: form.description.trim(),
                image: form.image.trim(),
                featured: form.featured,
                sortOrder: parseInt(form.sortOrder || '0', 10) || 0,
            };

            const res = await fetch(isEditing ? `/api/categories/${form.id}` : '/api/categories', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to save category');
            }

            await fetchCategories();
            resetForm();
            setSuccess(isEditing ? 'Category updated successfully.' : 'Category created successfully.');
        } catch (err: any) {
            setError(err?.message || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Categories</h1>
                    <p>Create and manage the categories used across admin, collections, and shop filters.</p>
                </div>
            </div>

            <div className={styles.grid}>
                <section className={styles.card}>
                    <h2>{isEditing ? 'Edit Category' : 'New Category'}</h2>
                    <p>These categories become the source of truth for products and storefront collections.</p>

                    {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}
                    {success ? <div className={`${styles.message} ${styles.success}`}>{success}</div> : null}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="category-name">Category Name</label>
                            <input
                                id="category-name"
                                className={styles.input}
                                value={form.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="e.g. Hoodies"
                                maxLength={60}
                                required
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label htmlFor="category-slug">Slug</label>
                                <input
                                    id="category-slug"
                                    className={styles.input}
                                    value={form.slug}
                                    onChange={(e) => {
                                        setSlugTouched(true);
                                        setField('slug', slugifyCategoryName(e.target.value));
                                    }}
                                    placeholder="hoodies"
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="category-order">Sort Order</label>
                                <input
                                    id="category-order"
                                    type="number"
                                    className={styles.input}
                                    value={form.sortOrder}
                                    onChange={(e) => setField('sortOrder', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="category-description">Description</label>
                            <textarea
                                id="category-description"
                                className={styles.textarea}
                                value={form.description}
                                onChange={(e) => setField('description', e.target.value)}
                                placeholder="Short customer-facing description for this category"
                                maxLength={300}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="category-image">Category Image URL</label>
                            <input
                                id="category-image"
                                className={styles.input}
                                value={form.image}
                                onChange={(e) => setField('image', e.target.value)}
                                placeholder="https://..."
                                required
                            />
                        </div>

                        <div className={styles.uploadRow}>
                            <button
                                type="button"
                                className={styles.uploadBtn}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />}
                                {' '}
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => handleUpload(e.target.files)}
                            />
                        </div>

                        <div className={styles.checkboxRow}>
                            <input
                                id="category-featured"
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => setField('featured', e.target.checked)}
                            />
                            <label htmlFor="category-featured">Show as featured category on the homepage</label>
                        </div>

                        {form.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={form.image} alt={form.name || 'Category preview'} className={styles.imagePreview} />
                        ) : (
                            <div className={styles.imagePlaceholder}>
                                <FolderTree size={28} />
                            </div>
                        )}

                        <div className={styles.actions} style={{ marginTop: '1rem' }}>
                            <button type="submit" className={styles.primaryBtn} disabled={saving || uploading}>
                                {saving ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
                            </button>
                            <button type="button" className={styles.secondaryBtn} onClick={resetForm}>
                                Clear
                            </button>
                        </div>
                    </form>
                </section>

                <section className={styles.card}>
                    <h2>All Categories</h2>
                    <p>Use these in product creation, collections, and storefront filters.</p>

                    {loading ? (
                        <div className={styles.empty}>
                            <Loader2 size={22} className="spin" />
                            <div>Loading categories...</div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className={styles.empty}>No categories yet. Create your first one to start wiring products.</div>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Slug</th>
                                        <th>Products</th>
                                        <th>Featured</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category._id}>
                                            <td data-label="Category">
                                                <div className={styles.cellTitle}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={category.image} alt={category.name} className={styles.thumb} />
                                                    <div>
                                                        <div className={styles.name}>{category.name}</div>
                                                        <div className={styles.muted}>{category.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Slug" className={styles.muted}>{category.slug}</td>
                                            <td data-label="Products">{category.productCount || 0}</td>
                                            <td data-label="Featured">
                                                <span className={`${styles.badge} ${category.featured ? styles.badgeOn : styles.badgeOff}`}>
                                                    {category.featured ? 'Featured' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td data-label="Actions">
                                                <div className={styles.actions}>
                                                    <button type="button" className={styles.secondaryBtn} onClick={() => handleEdit(category)}>
                                                        <Pencil size={16} /> Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.dangerBtn}
                                                        onClick={() => handleDelete(category)}
                                                        disabled={deletingId === category._id}
                                                    >
                                                        {deletingId === category._id ? <Loader2 size={16} /> : <Trash2 size={16} />}
                                                        {' '}
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}