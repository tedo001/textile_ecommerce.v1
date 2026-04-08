'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

type Dashboard = {
  summary: { products: number; users: number; orders: number; revenue: number };
  topProducts: { name: string; qty: number; revenue: number }[];
  dailyActivity: { _id: { day: string; type: string }; count: number }[];
  mlMetrics: any;
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    api.get('/admin/dashboard').then((r) => setData(r.data));
  }, [user, loading, router]);

  if (!data) return <div className="container-responsive py-20">Loading…</div>;

  // Pivot daily activity into a chart-friendly shape
  const days: Record<string, any> = {};
  for (const row of data.dailyActivity) {
    days[row._id.day] = days[row._id.day] || { day: row._id.day };
    days[row._id.day][row._id.type] = row.count;
  }
  const series = Object.values(days);

  return (
    <div className="container-responsive py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-brand-900">Admin dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/products" className="btn-outline">Manage products</Link>
          <Link href="/admin/orders" className="btn-outline">Orders</Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Products" value={data.summary.products} />
        <Stat label="Customers" value={data.summary.users} />
        <Stat label="Orders" value={data.summary.orders} />
        <Stat label="Revenue" value={formatCurrency(data.summary.revenue)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-semibold text-brand-900">Top selling products</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e9d9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} dy={10} height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="qty" fill="#86592e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-brand-900">User activity (last 30 days)</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e9d9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="view" stroke="#a9743a" />
                <Line type="monotone" dataKey="add_to_cart" stroke="#86592e" />
                <Line type="monotone" dataKey="purchase" stroke="#624126" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <h2 className="font-semibold text-brand-900">ML model metrics</h2>
        {data.mlMetrics && Object.keys(data.mlMetrics).length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {Object.entries(data.mlMetrics.models || {}).map(([name, m]: any) => (
              <div key={name} className="rounded-lg bg-brand-50 p-4">
                <p className="text-xs uppercase text-brand-500">{name}</p>
                <p className="text-2xl font-bold text-brand-800">
                  {m.metric_value ? Number(m.metric_value).toFixed(3) : '—'}
                </p>
                <p className="text-xs text-brand-600">{m.metric_name}</p>
                <p className="mt-1 text-[10px] text-brand-500">version {m.version || '1'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-brand-500">ML service unreachable.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-brand-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-900">{value}</p>
    </div>
  );
}
