'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Product } from '@/lib/api';
import ProductGrid from '@/components/products/ProductGrid';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/products', { params: { limit: 8, sort: 'popular' } }).then((r) => r.data.items || []).catch(() => []),
      api.get('/products/trending').then((r) => r.data.items || []).catch(() => []),
    ]).then(([feat, trend]) => {
      setFeatured(feat);
      setTrending(trend);
      setLoaded(true);
    });
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-brand-100 to-brand-50">
        <div className="container-responsive grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
              Spring / Summer Collection
            </p>
            <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-brand-900 md:text-6xl">
              Threads that tell <span className="italic">your story</span>.
            </h1>
            <p className="mt-4 max-w-md text-lg text-brand-700">
              Hand-picked textiles, timeless silhouettes, and AI-powered recommendations that understand your style.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/products" className="btn-primary">Shop the collection</Link>
              <Link href="/search" className="btn-outline">Smart search</Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-brand-200 shadow-card">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200')] bg-cover bg-center opacity-90" />
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="container-responsive py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-brand-900">Trending now</h2>
            <p className="text-sm text-brand-600">
              Predicted by our demand forecasting model
            </p>
          </div>
          <Link href="/products?sort=popular" className="text-sm font-medium text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        {loaded ? (
          <ProductGrid products={trending.length ? trending : featured} />
        ) : (
          <div className="py-8 text-center text-brand-400">Loading products…</div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-brand-50 py-16">
        <div className="container-responsive">
          <h2 className="mb-8 text-center font-display text-3xl font-semibold text-brand-900">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {['saree', 'shirt', 'kurta', 'fabric'].map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${cat}`}
                className="card group flex aspect-square items-center justify-center text-center font-display text-2xl capitalize text-brand-800 transition-shadow hover:shadow-md"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container-responsive py-16">
        <h2 className="mb-6 font-display text-3xl font-semibold text-brand-900">Featured</h2>
        {loaded ? (
          <ProductGrid products={featured} />
        ) : (
          <div className="py-8 text-center text-brand-400">Loading products…</div>
        )}
      </section>
    </>
  );
}
