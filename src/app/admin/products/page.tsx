"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

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
        if (stock === 0) return 'Out of Stock';
        if (stock <= 10) return 'Low Stock';
        return 'Active';
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingState}>
                    <Loader2 size={32} className={styles.spinner} />
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Products</h1>
                    <p className={styles.subtitle}>Manage your product inventory</p>
                </div>
                <Link href="/admin/products/new">
                    <Button>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        Add Product
                    </Button>
                </Link>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <select className={styles.filterSelect}>
                    <option value="">All Categories</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="tshirts">T-Shirts</option>
                    <option value="pants">Pants</option>
                </select>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product Name</th>
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
                                    <td className={styles.productName}>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>${product.price.toFixed(2)}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <span className={`${styles.badge} ${
                                            status === 'Low Stock' ? styles.badgeWarning : 
                                            status === 'Out of Stock' ? styles.badgeDanger : 
                                            styles.badgeSuccess
                                        }`}>
                                            {status}
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

            {filteredProducts.length === 0 && (
                <div className={styles.emptyState}>
                    <p>{products.length === 0 ? 'No products yet. Add your first product!' : 'No products found'}</p>
                </div>
            )}
        </div>
    );
}
