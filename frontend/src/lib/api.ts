import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: false,
});

// Attach JWT (if any) on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('threadly_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('threadly_token');
    }
    return Promise.reject(err);
  }
);

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  fabric: string;
  color: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  tags: string[];
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
};
