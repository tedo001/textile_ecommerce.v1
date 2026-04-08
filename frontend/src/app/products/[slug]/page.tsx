'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { api, Product } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { formatCurrency } from '@/lib/format';
import ProductGrid from '@/components/products/ProductGrid';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const addItem = useCart((s) => s.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewBody, setReviewBody] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!slug) return;
    api.get(`/products/slug/${slug}`).then((r) => {
      setProduct(r.data.product);
      // After we know the product id, fetch recommendations and reviews
      api
        .get('/ml/recommend', { params: { productId: r.data.product._id, k: 8 } })
        .then((rr) => setRecommendations(rr.data.items || []))
        .catch(() => setRecommendations([]));
      api
        .get(`/reviews/product/${r.data.product._id}`)
        .then((rv) => setReviews(rv.data.reviews || []))
        .catch(() => setReviews([]));
    });
  }, [slug]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      const { data } = await api.post(`/reviews/product/${product._id}`, {
        rating,
        body: reviewBody,
      });
      if (data.review.isFlagged) {
        toast('Your review has been flagged for moderation', { icon: '⚠️' });
      } else {
        toast.success('Thanks for your review!');
      }
      setReviewBody('');
      const rv = await api.get(`/reviews/product/${product._id}`);
      setReviews(rv.data.reviews);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Sign in to leave a review');
    }
  };

  if (!product) return <div className="container-responsive py-20">Loading…</div>;

  return (
    <div className="container-responsive py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-brand-50">
          {product.images?.[0] && (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
          )}
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-brand-500">{product.category}</p>
          <h1 className="mt-1 font-display text-4xl font-semibold text-brand-900">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-brand-700">
            <Star className="h-4 w-4 fill-current text-amber-500" />
            {product.rating.toFixed(1)} • {product.numReviews} reviews
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-800">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-base text-brand-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
          <p className="mt-6 text-brand-700">{product.description}</p>

          <div className="mt-8 flex gap-3">
            <button
              className="btn-primary flex-1"
              onClick={async () => {
                await addItem(product, 1);
                toast.success('Added to cart');
              }}
            >
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
            <button
              className="btn-outline"
              onClick={async () => {
                try {
                  await api.post('/wishlist/toggle', { productId: product._id });
                  toast.success('Wishlist updated');
                } catch {
                  toast.error('Sign in first');
                }
              }}
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-brand-600">
            <div className="rounded-lg bg-brand-50 p-3">Free shipping over ₹999</div>
            <div className="rounded-lg bg-brand-50 p-3">7-day returns</div>
            <div className="rounded-lg bg-brand-50 p-3">Authentic handloom</div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-brand-900">Reviews</h2>
        <form onSubmit={submitReview} className="mt-4 max-w-xl space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                aria-label={`${n} stars`}
              >
                <Star
                  className={`h-5 w-5 ${
                    n <= rating ? 'fill-current text-amber-500' : 'text-brand-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            className="input"
            rows={3}
            placeholder="Share your experience…"
            value={reviewBody}
            onChange={(e) => setReviewBody(e.target.value)}
            required
          />
          <button className="btn-primary">Submit review</button>
        </form>

        <ul className="mt-8 space-y-4">
          {reviews.map((r) => (
            <li key={r._id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-brand-900">{r.user?.name || 'Anonymous'}</p>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-brand-700">{r.body}</p>
              {r.isFlagged && (
                <p className="mt-2 text-xs text-amber-600">Flagged by ML — pending review</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Recommendations */}
      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold text-brand-900">You might also like</h2>
        <ProductGrid products={recommendations} />
      </section>
    </div>
  );
}
