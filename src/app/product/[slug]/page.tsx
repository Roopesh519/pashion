import React from 'react';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/Container';
import ProductGallery from '@/components/product-detail/ProductGallery';
import ProductInfo from '@/components/product-detail/ProductInfo';
import ProductCard from '@/components/products/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import styles from './page.module.css';

async function getProduct(slug: string) {
    await dbConnect();
    const product = await Product.findOne({ slug }).lean();
    return product;
}

async function getRelatedProducts(category: string, excludeSlug: string) {
    await dbConnect();
    const products = await Product.find({ 
        category, 
        slug: { $ne: excludeSlug } 
    }).limit(3).lean();
    return products;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug);
    if (!product) {
        return { title: 'Product Not Found - Pashion' };
    }
    return {
        title: `${(product as any).name} - Pashion`,
        description: (product as any).description?.substring(0, 160),
    };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const dbProduct = await getProduct(params.slug);
    
    if (!dbProduct) {
        notFound();
    }

    const product = dbProduct as any;
    
    // Transform for ProductInfo component
    const productData = {
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        description: product.description,
        images: product.images || ['/hoodie.png'],
        sizes: product.sizes || ['S', 'M', 'L', 'XL'],
        colors: product.colors || [
            { name: 'Black', value: '#000000' },
        ],
        slug: product.slug,
    };

    // Get related products
    const relatedDbProducts = await getRelatedProducts(product.category, product.slug);
    const relatedProducts = relatedDbProducts.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        image: p.images?.[0] || '/hoodie.png',
        slug: p.slug,
    }));

    return (
        <div className={styles.page}>
            <Container>
                <div className={styles.grid}>
                    <ProductGallery images={productData.images} />
                    <ProductInfo product={productData} />
                </div>

                {relatedProducts.length > 0 && (
                    <div className={styles.related}>
                        <h2 className={styles.relatedTitle}>You May Also Like</h2>
                        <div className={styles.relatedGrid}>
                            {relatedProducts.map((relProduct) => (
                                <ProductCard key={relProduct.id} product={relProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}
