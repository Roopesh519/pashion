"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import Button from '../ui/Button';
import styles from './FilterSidebar.module.css';

export default function FilterSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 200]);

    // Mock categories
    const categories = [
        'All Products', 'New Arrivals', 'Streetwear', 'Accessories', 'Outerwear', 'Denim'
    ];

    // Mock sizes
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    // Mock colors
    const colors = [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#ffffff' },
        { name: 'Gray', value: '#808080' },
        { name: 'Red', value: '#ff0000' },
        { name: 'Blue', value: '#0000ff' },
    ];

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

                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Categories</h4>
                    <ul className={styles.list}>
                        {categories.map((cat) => (
                            <li key={cat}>
                                <label className={styles.checkboxLabel}>
                                    <input type="checkbox" className={styles.checkbox} />
                                    {cat}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

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

                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Size</h4>
                    <div className={styles.sizeGrid}>
                        {sizes.map((size) => (
                            <button key={size} className={styles.sizeBtn}>{size}</button>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Color</h4>
                    <div className={styles.colorGrid}>
                        {colors.map((color) => (
                            <button
                                key={color.name}
                                className={styles.colorBtn}
                                style={{ backgroundColor: color.value }}
                                aria-label={color.name}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button fullWidth>Apply Filters</Button>
                </div>
            </aside>

            {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
        </>
    );
}
