import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, Product } from './api';

export type CartLine = { product: Product; quantity: number };

type CartState = {
  items: CartLine[];
  syncing: boolean;
  loadFromServer: () => Promise<void>;
  addItem: (product: Product, qty?: number) => Promise<void>;
  updateQuantity: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  totals: () => { subtotal: number; itemCount: number };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      syncing: false,

      loadFromServer: async () => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('threadly_token');
        if (!token) return;
        try {
          set({ syncing: true });
          const { data } = await api.get('/cart');
          const items: CartLine[] = (data.cart?.items || []).map((i: any) => ({
            product: i.product,
            quantity: i.quantity,
          }));
          set({ items });
        } finally {
          set({ syncing: false });
        }
      },

      addItem: async (product, qty = 1) => {
        const token =
          typeof window !== 'undefined' && localStorage.getItem('threadly_token');
        if (token) {
          await api.post('/cart/items', { productId: product._id, quantity: qty });
          await get().loadFromServer();
        } else {
          set((s) => {
            const existing = s.items.find((i) => i.product._id === product._id);
            const items = existing
              ? s.items.map((i) =>
                  i.product._id === product._id ? { ...i, quantity: i.quantity + qty } : i
                )
              : [...s.items, { product, quantity: qty }];
            return { items };
          });
        }
      },

      updateQuantity: async (productId, qty) => {
        const token =
          typeof window !== 'undefined' && localStorage.getItem('threadly_token');
        if (token) {
          await api.patch('/cart/items', { productId, quantity: qty });
          await get().loadFromServer();
        } else {
          set((s) => ({
            items:
              qty <= 0
                ? s.items.filter((i) => i.product._id !== productId)
                : s.items.map((i) =>
                    i.product._id === productId ? { ...i, quantity: qty } : i
                  ),
          }));
        }
      },

      removeItem: async (productId) => {
        const token =
          typeof window !== 'undefined' && localStorage.getItem('threadly_token');
        if (token) {
          await api.delete(`/cart/items/${productId}`);
          await get().loadFromServer();
        } else {
          set((s) => ({ items: s.items.filter((i) => i.product._id !== productId) }));
        }
      },

      clear: async () => {
        const token =
          typeof window !== 'undefined' && localStorage.getItem('threadly_token');
        if (token) await api.delete('/cart');
        set({ items: [] });
      },

      totals: () => {
        const items = get().items;
        const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
        const itemCount = items.reduce((s, i) => s + i.quantity, 0);
        return { subtotal, itemCount };
      },
    }),
    { name: 'threadly-cart' }
  )
);
