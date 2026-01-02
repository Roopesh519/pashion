"use client";

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import Button from '../ui/Button';
import styles from './FilterSidebar.module.css';

type FilterSidebarProps = {
    categories: string[];
    sizes: string[];
    colors: string[];
    searchParams?: Record<string, string | string[]>;
};

export default function FilterSidebar({ categories = [], sizes = [], colors = [], searchParams = {} }: FilterSidebarProps) {
    const router = useRouter();
    const searchParamsObj = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    
    // Initialize from searchParams
    const initMinPrice = searchParams?.minPrice ? parseInt(searchParams.minPrice as string) : 0;
    const initMaxPrice = searchParams?.maxPrice ? parseInt(searchParams.maxPrice as string) : 500;
    const [priceRange, setPriceRange] = useState([initMinPrice, initMaxPrice]);

    const initCategories = Array.isArray(searchParams?.category) 
        ? searchParams.category 
        : (searchParams?.category ? [searchParams.category] : []);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(initCategories));
    
    const initSizes = Array.isArray(searchParams?.size) 
        ? searchParams.size 
        : (searchParams?.size ? [searchParams.size] : []);
    const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set(initSizes));
    
    const initColors = Array.isArray(searchParams?.color) 
        ? searchParams.color 
        : (searchParams?.color ? [searchParams.color] : []);
    const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set(initColors));

    const buildUrl = (newParams: Record<string, any>) => {
        const params = new URLSearchParams();
        
        // Add selected categories
        if (newParams.categories && newParams.categories.size > 0) {
            newParams.categories.forEach((cat: string) => params.append('category', cat));
        }
        
        // Add selected sizes
        if (newParams.sizes && newParams.sizes.size > 0) {
            newParams.sizes.forEach((size: string) => params.append('size', size));
        }
        
        // Add selected colors
        if (newParams.colors && newParams.colors.size > 0) {
            newParams.colors.forEach((color: string) => params.append('color', color));
        }
        
        // Add price range
        if (newParams.minPrice !== undefined) params.set('minPrice', newParams.minPrice.toString());
        if (newParams.maxPrice !== undefined) params.set('maxPrice', newParams.maxPrice.toString());
        
        return `/shop?${params.toString()}`;
    };

    const handleApplyFilters = () => {
        const url = buildUrl({
            categories: selectedCategories,
            sizes: selectedSizes,
            colors: selectedColors,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
        });
        router.push(url);
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        setSelectedCategories(new Set());
        setSelectedSizes(new Set());
        setSelectedColors(new Set());
        setPriceRange([0, 500]);
        router.push('/shop');
        setIsOpen(false);
    };

    const toggleCategory = (cat: string) => {
        const updated = new Set(selectedCategories);
        if (updated.has(cat)) {
            updated.delete(cat);
        } else {
            updated.add(cat);
        }
        setSelectedCategories(updated);
    };

    const toggleSize = (size: string) => {
        const updated = new Set(selectedSizes);
        if (updated.has(size)) {
            updated.delete(size);
        } else {
            updated.add(size);
        }
        setSelectedSizes(updated);
    };

    const toggleColor = (color: string) => {
        const updated = new Set(selectedColors);
        if (updated.has(color)) {
            updated.delete(color);
        } else {
            updated.add(color);
        }
        setSelectedColors(updated);
    };

    // Map color names to sample hex values
    const colorMap: Record<string, string> = {
        'Black': '#000000',
        'White': '#ffffff',
        'Red': '#ff0000',
        'Blue': '#0000ff',
        'Green': '#00aa00',
        'Yellow': '#ffff00',
        'Gray': '#808080',
        'Pink': '#ff69b4',
        'Purple': '#800080',
    };

    return (
        <>
            <div className={styles.mobileToggle}>
                <Button variant="outline" fullWidth onClick={() => setIsOpen(true)}>
                    <SlidersHorizontal size={18} style={{ marginRight: '8px' }} /> Filters
                </Button>
            </div>

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <h3>Filters</h3>
                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                {(selectedCategories.size > 0 || selectedSizes.size > 0 || selectedColors.size > 0 || priceRange[0] > 0 || priceRange[1] < 500) && (
                    <button onClick={handleClearFilters} style={{ padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', marginBottom: 12, width: '100%', fontSize: '0.875rem' }}>
                        Clear All Filters
                    </button>
                )}

                {categories.length > 0 && (
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Categories</h4>
                        <ul className={styles.list}>
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <label className={styles.checkboxLabel}>
                                        <input 
                                            type="checkbox" 
                                            className={styles.checkbox}
                                            checked={selectedCategories.has(cat)}
                                            onChange={() => toggleCategory(cat)}
                                        />
                                        {cat}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Price Range</h4>
                    <div className={styles.priceInputs}>
                        <input
                            type="range"
                            min="0"
                            max="500"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                            className={styles.rangeSlider}
                        />
                        <div className={styles.priceLabels}>
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                        </div>
                    </div>
                </div>

                {sizes.length > 0 && (
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Size</h4>
                        <div className={styles.sizeGrid}>
                            {sizes.map((size) => (
                                <button 
                                    key={size} 
                                    className={`${styles.sizeBtn} ${selectedSizes.has(size) ? styles.sizeSelected : ''}`}
                                    onClick={() => toggleSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {colors.length > 0 && (
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Color</h4>
                        <div className={styles.colorGrid}>
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    className={`${styles.colorBtn} ${selectedColors.has(color) ? styles.colorSelected : ''}`}
                                    style={{ backgroundColor: colorMap[color] || '#cccccc' }}
                                    aria-label={color}
                                    onClick={() => toggleColor(color)}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.footer}>
                    <Button fullWidth onClick={handleApplyFilters}>Apply Filters</Button>
                </div>
            </aside>

            {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
        </>
    );
}
