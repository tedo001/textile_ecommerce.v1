'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/format';

const STATUSES = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    api.get('/orders/all').then((r) => setOrders(r.data.orders));
  }, [user, loading, router]);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    setOrders((o) => o.map((x) => (x._id === id ? { ...x, status } : x)));
    toast.success('Status updated');
  };

  return (
    <div className="container-responsive py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-900">Orders</h1>
      <ul className="mt-6 space-y-3">
        {orders.map((o) => (
          <li key={o._id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-brand-900">#{o._id.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-brand-500">
                {o.user?.name} • {new Date(o.createdAt).toLocaleString()}
              </p>
            </div>
            <p className="font-semibold">{formatCurrency(o.total)}</p>
            <select
              className="input w-40"
              value={o.status}
              onChange={(e) => updateStatus(o._id, e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
