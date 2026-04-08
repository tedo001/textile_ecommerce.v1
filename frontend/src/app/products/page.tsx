'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, Product } from '@/lib/api';
import ProductGrid from '@/components/products/ProductGrid';

const CATEGORIES = ['saree', 'shirt', 'kurta', 'fabric', 'dupatta', 'scarf'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'priceAsc', label: 'Price ↑' },
  { value: 'priceDesc', label: 'Price ↓' },
  { value: 'rating', label: 'Top rated' },
];

function ProductsPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const q = params.get('q') || '';

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { category, sort, minPrice, maxPrice, q, limit: 24 } })
      .then((r) => setProducts(r.data.items))
      .finally(() => setLoading(false));
  }, [category, sort, minPrice, maxPrice, q]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/products?${next.toString()}`);
  };

  return (
    <div className="container-responsive py-10">
      <h1 className="mb-2 font-display text-4xl font-semibold text-brand-900">Shop</h1>
      <p className="mb-8 text-sm text-brand-600">
        {products.length} {products.length === 1 ? 'product' : 'products'}
      </p>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="space-y-6 text-sm">
          <div>
            <h3 className="label">Category</h3>
            <div className="space-y-1">
              <button
                className={`block w-full rounded-md px-2 py-1 text-left ${
                  !category ? 'bg-brand-100 font-medium text-brand-800' : 'text-brand-600'
                }`}
                onClick={() => setParam('category', '')}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setParam('category', c)}
                  className={`block w-full rounded-md px-2 py-1 text-left capitalize ${
                    category === c ? 'bg-brand-100 font-medium text-brand-800' : 'text-brand-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="label">Price</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={minPrice}
                onBlur={(e) => setParam('minPrice', e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Max"
                defaultValue={maxPrice}
                onBlur={(e) => setParam('maxPrice', e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <h3 className="label">Sort by</h3>
            <select
              className="input"
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="py-16 text-center text-brand-500">Loading…</div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container-responsive py-16">Loading…</div>}>
      <ProductsPageInner />
    </Suspense>
  );
}
