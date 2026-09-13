"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import styles from '@/app/shop/page.module.css';

export type ListingProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  slug: string;
  badge?: string;
};

type Props = {
  initialProducts: ListingProduct[];
  initialTotal: number;
  query?: Record<string, string | string[]>;
  wishlistedIds: Set<string>;
  gridClassName: string;
  defaultBadge?: string;
};

const toCardProduct = (product: any, defaultBadge?: string): ListingProduct => ({
  id: product._id.toString(),
  name: product.name,
  price: product.price,
  originalPrice: product.originalPrice,
  image: product.images?.[0] || '/brand/placeholder.webp',
  hoverImage: product.images?.[1],
  slug: product.slug,
  badge: product.badge || (product.isFeatured ? 'FEATURED' : defaultBadge),
});

export default function InfiniteProductGrid({ initialProducts, initialTotal, query = {}, wishlistedIds, gridClassName, defaultBadge }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialProducts.length < initialTotal);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        (Array.isArray(value) ? value : [value]).forEach((entry) => params.append(key, entry));
      });
      params.set('offset', String(products.length));
      params.set('limit', '20');
      const response = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal });
      if (!response.ok) throw new Error('Failed to load more products');
      const data = await response.json();
      const nextProducts = (data.products || []).map((product: any) => toCardProduct(product, defaultBadge));
      setProducts((current) => {
        const known = new Set(current.map((product) => product.id));
        return [...current, ...nextProducts.filter((product: ListingProduct) => !known.has(product.id))];
      });
      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (error: any) {
      if (error.name !== 'AbortError') console.error('Failed to load more products:', error);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
      loadingRef.current = false;
    }
  }, [defaultBadge, hasMore, products.length, query]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void loadMore();
    }, { rootMargin: '300px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <div className={gridClassName}>
        {products.map((product) => <ProductCard key={product.id} product={product} wishlistedIds={wishlistedIds} />)}
        {loading && Array.from({ length: 4 }, (_, index) => <div className={styles.productSkeleton} key={`skeleton-${index}`} aria-hidden="true" />)}
      </div>
      {hasMore && <div ref={sentinelRef} className={styles.loadMoreSentinel} aria-label="Loading more products" />}
    </>
  );
}
