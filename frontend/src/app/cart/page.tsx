'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatCurrency } from '@/lib/format';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totals } = useCart();
  const { subtotal, itemCount } = totals();
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 49;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = subtotal + shipping + tax;

  if (!items.length) {
    return (
      <div className="container-responsive py-20 text-center">
        <h1 className="font-display text-3xl text-brand-900">Your cart is empty</h1>
        <p className="mt-2 text-brand-600">Time to find something beautiful.</p>
        <Link href="/products" className="btn-primary mt-6 inline-flex">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="container-responsive py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-900">Your cart ({itemCount})</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <ul className="space-y-4">
          {items.map((line) => (
            <li key={line.product._id} className="card flex items-center gap-4 p-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-brand-50">
                {line.product.images?.[0] && (
                  <Image src={line.product.images[0]} alt={line.product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/products/${line.product.slug}`} className="font-semibold text-brand-900 hover:underline">
                  {line.product.name}
                </Link>
                <p className="text-xs uppercase tracking-wide text-brand-500">{line.product.category}</p>
                <p className="mt-1 text-sm text-brand-700">{formatCurrency(line.product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full border border-brand-200 px-2"
                  onClick={() => updateQuantity(line.product._id, line.quantity - 1)}
                >
                  −
                </button>
                <span className="w-6 text-center">{line.quantity}</span>
                <button
                  className="rounded-full border border-brand-200 px-2"
                  onClick={() => updateQuantity(line.product._id, line.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button
                className="text-brand-500 hover:text-red-500"
                onClick={() => removeItem(line.product._id)}
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <aside className="card sticky top-24 h-fit p-6">
          <h2 className="font-display text-xl font-semibold text-brand-900">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{shipping ? formatCurrency(shipping) : 'Free'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax (5%)</dt>
              <dd>{formatCurrency(tax)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-brand-100 pt-2 font-semibold">
              <dt>Total</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
