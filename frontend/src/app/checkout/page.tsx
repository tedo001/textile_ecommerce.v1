'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/format';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totals, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState({
    line1: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
  });

  const { subtotal } = totals();
  const shipping = subtotal > 999 ? 0 : 49;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = subtotal + shipping + tax;

  if (!user) {
    return (
      <div className="container-responsive py-20 text-center">
        <h1 className="font-display text-3xl text-brand-900">Sign in to continue</h1>
        <a href="/login" className="btn-primary mt-4 inline-flex">Sign in</a>
      </div>
    );
  }

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress: address });
      await clear();
      toast.success('Order placed!');
      router.push(`/account/orders/${data.order._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-responsive py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-900">Checkout</h1>
      <form onSubmit={place} className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="card space-y-4 p-6">
          <h2 className="font-semibold text-brand-900">Shipping address</h2>
          <div>
            <label className="label">Address line</label>
            <input
              required
              className="input"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City</label>
              <input
                required
                className="input"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                required
                className="input"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Postal code</label>
              <input
                required
                className="input"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Country</label>
              <input
                className="input"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-brand-500">Demo only. Cash on delivery is the default payment method.</p>
        </div>

        <aside className="card h-fit p-6">
          <h2 className="font-semibold text-brand-900">Order</h2>
          <ul className="mt-3 divide-y divide-brand-100 text-sm">
            {items.map((i) => (
              <li key={i.product._id} className="flex justify-between py-2">
                <span>
                  {i.product.name} × {i.quantity}
                </span>
                <span>{formatCurrency(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-brand-100 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping ? formatCurrency(shipping) : 'Free'}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button disabled={submitting || !items.length} className="btn-primary mt-6 w-full">
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
