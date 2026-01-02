"use client";

import React, { useState } from 'react';
import styles from './ProductGallery.module.css';

interface ProductGalleryProps {
    images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    return (
        <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
                <img src={selectedImage} alt="Product" className={styles.mainImage} />
            </div>
            <div className={styles.thumbnails}>
                {images.map((img, index) => (
                    <button
                        key={index}
                        className={`${styles.thumbnail} ${selectedImage === img ? styles.active : ''}`}
                        onClick={() => setSelectedImage(img)}
                    >
                        <img src={img} alt={`Product thumbnail ${index + 1}`} />
                    </button>
                ))}
            </div>
        </div>
    );
}
