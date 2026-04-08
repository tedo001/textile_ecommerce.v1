'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { api, Product } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/format';

const empty = {
  name: '',
  slug: '',
  description: '',
  category: 'shirt',
  fabric: 'cotton',
  color: '',
  price: 0,
  stock: 0,
  images: '',
  tags: '',
};

export default function AdminProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const refresh = () =>
    api.get('/products', { params: { limit: 100 } }).then((r) => setProducts(r.data.items));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images.split(',').map((s: string) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s: string) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await api.patch(`/products/${editing}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setForm(empty);
      setEditing(null);
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed');
    }
  };

  const edit = (p: Product) => {
    setEditing(p._id);
    setForm({
      ...p,
      images: p.images.join(','),
      tags: p.tags.join(','),
    });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    refresh();
  };

  return (
    <div className="container-responsive py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-900">Manage products</h1>

      <form onSubmit={save} className="card mt-6 grid gap-3 p-6 md:grid-cols-2">
        <input className="input" required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" required placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {['shirt', 'saree', 'kurta', 'fabric', 'dupatta', 'scarf', 'other'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input className="input" placeholder="Fabric" value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} />
        <input className="input" placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        <input className="input" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input className="input md:col-span-2" placeholder="Image URLs (comma separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
        <input className="input md:col-span-2" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <textarea className="input md:col-span-2" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="md:col-span-2 flex gap-2">
          <button className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          {editing && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="mt-8 divide-y divide-brand-100">
        {products.map((p) => (
          <li key={p._id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold text-brand-900">{p.name}</p>
              <p className="text-xs text-brand-500">{p.category} • {formatCurrency(p.price)} • stock {p.stock}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-outline" onClick={() => edit(p)}>Edit</button>
              <button className="btn-outline" onClick={() => remove(p._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
