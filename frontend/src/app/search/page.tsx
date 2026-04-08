'use client';

import { useState } from 'react';
import { Search as SearchIcon, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, Product } from '@/lib/api';
import ProductGrid from '@/components/products/ProductGrid';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { q, limit: 24 } });
      setResults(data.items);
    } finally {
      setLoading(false);
    }
  };

  const imageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/ml/image-search', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(data.items || []);
      if (!data.items?.length) toast('No similar items found yet — train the model!');
    } catch {
      toast.error('Image search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-responsive py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-900">Smart search</h1>
      <p className="text-brand-600">Search by keyword or upload a fabric photo to find lookalikes.</p>

      <form onSubmit={search} className="mt-6 flex max-w-2xl gap-2">
        <input
          className="input flex-1"
          placeholder="silk saree, linen shirt, indigo kurta…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-primary">
          <SearchIcon className="h-4 w-4" /> Search
        </button>
        <label className="btn-outline cursor-pointer">
          <Upload className="h-4 w-4" />
          <input type="file" accept="image/*" onChange={imageSearch} className="hidden" />
        </label>
      </form>

      <div className="mt-10">
        {loading ? <p className="text-brand-500">Loading…</p> : <ProductGrid products={results} />}
      </div>
    </div>
  );
}
