"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, Pencil, Trash2, Search, Loader2, Box, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import styles from '../shared/listing.module.css';

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    slug: string;
    images: string[];
}

interface CategoryOption {
    _id: string;
    name: string;
}

export default function AdminProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const fetchProducts = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/categories'),
            ]);

            const productsData = await productsRes.json();
            if (productsData.products) {
                setProducts(productsData.products);
            }

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                setCategories(categoriesData.categories || []);
            }
        } catch (error) {
            // silently fail, products stay empty
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        setDeleting(productId);
        try {
            const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p._id !== productId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete product');
            }
        } catch (error) {
            alert('Failed to delete product');
        } finally {
            setDeleting(null);
        }
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(p => p._id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(pId => pId !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;
        
        setIsBulkDeleting(true);
        try {
            await Promise.all(selectedProducts.map(id => fetch(`/api/products/${id}`, { method: 'DELETE' })));
            setProducts(products.filter(p => !selectedProducts.includes(p._id)));
            setSelectedProducts([]);
        } catch (error) {
            alert('Failed to delete some products');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const getStatus = (stock: number) => {
        if (stock === 0) return { label: 'Out of Stock', class: styles.badgeDanger };
        if (stock <= 10) return { label: 'Low Stock', class: styles.badgeWarning };
        return { label: 'In Stock', class: styles.badgeSuccess };
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let valA: any = a[sortColumn as keyof Product];
        let valB: any = b[sortColumn as keyof Product];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Stats
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingState}>
                    <Loader2 size={40} className={styles.spinner} />
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>
                        <Package size={24} />
                    </div>
                    <div className={styles.headerText}>
                        <h1>Products</h1>
                        <p>Manage your product inventory</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/products/new" className={styles.addBtn}>
                        <Plus size={18} />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                        <Box size={22} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{totalProducts}</h3>
                        <p>Total Products</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <CheckCircle size={22} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{formatCurrency(totalValue)}</h3>
                        <p>Inventory Value</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconYellow}`}>
                        <AlertTriangle size={22} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{lowStockCount}</h3>
                        <p>Low Stock</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                        <Package size={22} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{outOfStockCount}</h3>
                        <p>Out of Stock</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar} style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <select 
                        className={styles.filterSelect}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category.name}>{category.name}</option>
                        ))}
                    </select>
                </div>
                {selectedProducts.length > 0 && (
                    <button 
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={handleBulkDelete}
                        disabled={isBulkDeleting}
                        style={{ padding: '0.5rem 1rem', borderRadius: '4px', width: 'auto' }}
                    >
                        {isBulkDeleting ? <Loader2 size={16} className={styles.spinner} /> : <Trash2 size={16} />}
                        <span style={{ marginLeft: 8 }}>Delete Selected ({selectedProducts.length})</span>
                    </button>
                )}
            </div>

            {/* Table */}
            {filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>
                    <Package size={48} />
                    <p>{products.length === 0 ? 'No products yet' : 'No products found'}</p>
                    <span>{products.length === 0 ? 'Add your first product to get started' : 'Try adjusting your search or filters'}</span>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                                        onChange={toggleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                    Product {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Category</th>
                                <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                                    Price {sortColumn === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('stock')} style={{ cursor: 'pointer' }}>
                                    Stock {sortColumn === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProducts.map((product) => {
                                const status = getStatus(product.stock);
                                return (
                                    <tr key={product._id} className={selectedProducts.includes(product._id) ? styles.selectedRow : ''}>
                                        <td data-label="Select">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedProducts.includes(product._id)}
                                                onChange={() => toggleSelect(product._id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td data-label="Product">
                                            <div className={styles.itemCell}>
                                                {product.images?.[0] ? (
                                                    <img 
                                                        src={product.images[0]} 
                                                        alt={product.name}
                                                        className={styles.itemImage}
                                                    />
                                                ) : (
                                                    <div className={styles.itemImagePlaceholder}>
                                                        <Package size={18} />
                                                    </div>
                                                )}
                                                <div className={styles.itemInfo}>
                                                    <h4>{product.name}</h4>
                                                    <p>{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Category">{product.category}</td>
                                        <td data-label="Price" className={styles.cellBold}>{formatCurrency(product.price)}</td>
                                        <td data-label="Stock">{product.stock}</td>
                                        <td data-label="Status">
                                            <span className={`${styles.badge} ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className={styles.actions}>
                                                <Link href={`/admin/products/${product._id}/edit`}>
                                                    <button className={styles.actionBtn} title="Edit">
                                                        <Pencil size={16} />
                                                    </button>
                                                </Link>
                                                <button 
                                                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`} 
                                                    title="Delete"
                                                    onClick={() => handleDelete(product._id)}
                                                    disabled={deleting === product._id}
                                                >
                                                    {deleting === product._id ? (
                                                        <Loader2 size={16} className={styles.spinner} />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
