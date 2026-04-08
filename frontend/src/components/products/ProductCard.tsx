'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product, api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { formatCurrency } from '@/lib/format';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await addItem(product, 1);
      toast.success(`${product.name} added to cart`);
      api.post('/activity/track', { eventType: 'add_to_cart', productId: product._id }).catch(() => {});
    } catch {
      toast.error('Could not add to cart');
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await api.post('/wishlist/toggle', { productId: product._id });
      toast.success('Wishlist updated');
    } catch {
      toast.error('Sign in to use the wishlist');
    }
  };

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card group overflow-hidden"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-50">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brand-300">
              No image
            </div>
          )}
          {discount && (
            <span className="absolute left-3 top-3 rounded-full bg-brand-700 px-2 py-1 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
          <button
            onClick={handleWishlist}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 opacity-0 shadow-card transition-opacity group-hover:opacity-100"
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4 text-brand-700" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-brand-500">{product.category}</p>
          <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-brand-900">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-brand-800">{formatCurrency(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-xs text-brand-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              className="rounded-full bg-brand-700 p-2 text-white transition-transform hover:scale-110"
              aria-label="Add to cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
