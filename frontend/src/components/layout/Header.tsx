'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBag, Heart, User as UserIcon, Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

export default function Header() {
  const { user, logout } = useAuth();
  const { items, loadFromServer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    loadFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/85 backdrop-blur-md">
      <div className="container-responsive flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold text-brand-800">
          Threadly
        </Link>

        <nav className="hidden gap-8 text-sm font-medium text-brand-800 md:flex">
          <Link href="/products" className="hover:text-brand-600">Shop</Link>
          <Link href="/products?category=saree" className="hover:text-brand-600">Sarees</Link>
          <Link href="/products?category=shirt" className="hover:text-brand-600">Shirts</Link>
          <Link href="/products?category=fabric" className="hover:text-brand-600">Fabrics</Link>
          <Link href="/products?category=kurta" className="hover:text-brand-600">Kurtas</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" className="hidden rounded-full p-2 hover:bg-brand-50 md:inline-flex">
            <Search className="h-5 w-5 text-brand-700" />
          </Link>
          <Link href="/wishlist" className="hidden rounded-full p-2 hover:bg-brand-50 md:inline-flex">
            <Heart className="h-5 w-5 text-brand-700" />
          </Link>
          <Link href="/cart" className="relative rounded-full p-2 hover:bg-brand-50">
            <ShoppingBag className="h-5 w-5 text-brand-700" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link href={user.role === 'admin' ? '/admin' : '/account'} className="rounded-full p-2 hover:bg-brand-50">
                <UserIcon className="h-5 w-5 text-brand-700" />
              </Link>
              <button onClick={logout} className="text-sm font-medium text-brand-700 hover:underline">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden btn-primary md:inline-flex">
              Sign in
            </Link>
          )}
          <button
            className="rounded-full p-2 hover:bg-brand-50 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-brand-100 bg-white md:hidden">
          <div className="container-responsive flex flex-col gap-2 py-3 text-sm font-medium text-brand-800">
            <Link href="/products" onClick={() => setMobileOpen(false)}>Shop</Link>
            <Link href="/products?category=saree" onClick={() => setMobileOpen(false)}>Sarees</Link>
            <Link href="/products?category=shirt" onClick={() => setMobileOpen(false)}>Shirts</Link>
            <Link href="/products?category=fabric" onClick={() => setMobileOpen(false)}>Fabrics</Link>
            <Link href="/wishlist" onClick={() => setMobileOpen(false)}>Wishlist</Link>
            {user ? (
              <>
                <Link
                  href={user.role === 'admin' ? '/admin' : '/account'}
                  onClick={() => setMobileOpen(false)}
                >
                  {user.role === 'admin' ? 'Admin' : 'My Account'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
