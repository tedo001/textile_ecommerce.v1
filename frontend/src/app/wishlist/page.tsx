'use client';

import { useEffect, useState } from 'react';
import { api, Product } from '@/lib/api';
import ProductGrid from '@/components/products/ProductGrid';

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/wishlist')
      .then((r) => setProducts(r.data.wishlist?.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-responsive py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-900">Your wishlist</h1>
      <div className="mt-8">
        {loading ? (
          <p className="text-brand-500">Loading…</p>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
