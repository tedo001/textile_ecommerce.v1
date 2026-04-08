'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Welcome to Threadly!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Could not register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-responsive flex min-h-[70vh] items-center justify-center py-10">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-semibold text-brand-900">Create account</h1>
        <p className="mt-1 text-sm text-brand-600">
          Already have one? <Link href="/login" className="underline">Sign in</Link>
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}
