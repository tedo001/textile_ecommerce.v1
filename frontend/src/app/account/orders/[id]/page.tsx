'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.order));
  }, [id]);

  if (!order) return <div className="container-responsive py-20">Loading…</div>;

  return (
    <div className="container-responsive py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-900">
        Order #{order._id.slice(-6).toUpperCase()}
      </h1>
      <p className="text-brand-600">Placed {new Date(order.createdAt).toLocaleString()}</p>
      <p className="mt-2 inline-block rounded-full bg-brand-100 px-3 py-1 text-sm capitalize text-brand-800">
        {order.status}
      </p>

      <ul className="mt-6 divide-y divide-brand-100">
        {order.items.map((i: any) => (
          <li key={i.product} className="flex justify-between py-3">
            <span>{i.name} × {i.quantity}</span>
            <span>{formatCurrency(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 max-w-sm space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{order.shippingCost ? formatCurrency(order.shippingCost) : 'Free'}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
