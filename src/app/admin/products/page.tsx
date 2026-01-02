"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, Pencil, Trash2, Search, Loader2, Box, AlertTriangle, CheckCircle } from 'lucide-react';
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

export default function AdminProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.products) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
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

    const getStatus = (stock: number) => {
        if (stock === 0) return { label: 'Out of Stock', class: styles.badgeDanger };
        if (stock <= 10) return { label: 'Low Stock', class: styles.badgeWarning };
        return { label: 'In Stock', class: styles.badgeSuccess };
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || p.category.toLowerCase() === categoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
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
                        <h3>${totalValue.toLocaleString()}</h3>
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
            <div className={styles.toolbar}>
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
                    <option value="hoodie">Hoodies</option>
                    <option value="t-shirt">T-Shirts</option>
                    <option value="pants">Pants</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="accessories">Accessories</option>
                </select>
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
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                const status = getStatus(product.stock);
                                return (
                                    <tr key={product._id}>
                                        <td>
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
                                        <td>{product.category}</td>
                                        <td className={styles.cellBold}>${product.price.toFixed(2)}</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <span className={`${styles.badge} ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td>
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
