'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/format';

export default function AccountPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get('/orders/me').then((r) => setOrders(r.data.orders));
  }, [user]);

  if (!user) {
    return (
      <div className="container-responsive py-20 text-center">
        <Link href="/login" className="btn-primary">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="container-responsive py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-900">Hi, {user.name}</h1>
      <p className="text-brand-600">{user.email}</p>

      <h2 className="mt-10 font-display text-2xl font-semibold text-brand-900">Order history</h2>
      {!orders.length ? (
        <p className="mt-4 text-brand-600">You haven't placed any orders yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li key={o._id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-900">Order #{o._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-brand-500">
                    {new Date(o.createdAt).toLocaleString()} • {o.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(o.total)}</p>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs capitalize text-brand-700">
                    {o.status}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
