/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');

const sampleProducts = [
  {
    name: 'Banarasi Silk Saree — Crimson',
    slug: 'banarasi-silk-saree-crimson',
    description: 'Hand-woven Banarasi silk saree with intricate zari work, perfect for weddings.',
    category: 'saree',
    fabric: 'silk',
    color: 'crimson',
    price: 4499,
    compareAtPrice: 5999,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'],
    stock: 24,
    tags: ['saree', 'silk', 'wedding', 'banarasi'],
    rating: 4.7,
    numReviews: 38,
    popularity: 320,
  },
  {
    name: 'Linen Slim-Fit Shirt — Sand',
    slug: 'linen-slim-fit-shirt-sand',
    description: 'Breathable European linen shirt, slim-fit cut. Perfect for warm days.',
    category: 'shirt',
    fabric: 'linen',
    color: 'sand',
    price: 1299,
    compareAtPrice: 1799,
    images: ['https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600'],
    stock: 80,
    tags: ['shirt', 'linen', 'summer', 'mens'],
    rating: 4.4,
    numReviews: 102,
    popularity: 540,
  },
  {
    name: 'Handloom Cotton Kurta — Indigo',
    slug: 'handloom-cotton-kurta-indigo',
    description: 'Soft handloom cotton kurta with hand-block prints. Comfortable and ethical.',
    category: 'kurta',
    fabric: 'cotton',
    color: 'indigo',
    price: 1599,
    images: ['https://images.unsplash.com/photo-1622445275576-721325763afe?w=600'],
    stock: 45,
    tags: ['kurta', 'cotton', 'handloom', 'mens'],
    rating: 4.6,
    numReviews: 64,
    popularity: 210,
  },
  {
    name: 'Pure Pashmina Shawl — Ivory',
    slug: 'pure-pashmina-shawl-ivory',
    description: 'Ultra-soft hand-spun Kashmiri pashmina. A timeless winter staple.',
    category: 'scarf',
    fabric: 'wool',
    color: 'ivory',
    price: 3799,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'],
    stock: 18,
    tags: ['shawl', 'pashmina', 'winter'],
    rating: 4.9,
    numReviews: 22,
    popularity: 95,
  },
  {
    name: 'Block-Print Cotton Fabric (per metre)',
    slug: 'block-print-cotton-fabric',
    description: 'Hand block-printed cotton in 110cm width. Sold per metre.',
    category: 'fabric',
    fabric: 'cotton',
    color: 'multi',
    price: 449,
    images: ['https://images.unsplash.com/photo-1606293459337-04a6c7c12b7d?w=600'],
    stock: 200,
    tags: ['fabric', 'cotton', 'block-print'],
    rating: 4.3,
    numReviews: 15,
    popularity: 80,
  },
  {
    name: 'Chanderi Silk Dupatta — Mint',
    slug: 'chanderi-silk-dupatta-mint',
    description: 'Lightweight Chanderi silk dupatta with gold border. Pairs beautifully with kurtas.',
    category: 'dupatta',
    fabric: 'silk',
    color: 'mint',
    price: 1299,
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600'],
    stock: 50,
    tags: ['dupatta', 'silk', 'chanderi'],
    rating: 4.5,
    numReviews: 28,
    popularity: 140,
  },
  {
    name: 'Oxford Cotton Shirt — Sky Blue',
    slug: 'oxford-cotton-shirt-sky-blue',
    description: 'Classic Oxford cotton shirt with button-down collar. Wardrobe essential.',
    category: 'shirt',
    fabric: 'cotton',
    color: 'sky',
    price: 1499,
    images: ['https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600'],
    stock: 120,
    tags: ['shirt', 'cotton', 'oxford', 'office'],
    rating: 4.5,
    numReviews: 88,
    popularity: 410,
  },
  {
    name: 'Kanjivaram Silk Saree — Royal Blue',
    slug: 'kanjivaram-silk-saree-royal-blue',
    description: 'Pure Kanjivaram silk with traditional temple border. A heirloom piece.',
    category: 'saree',
    fabric: 'silk',
    color: 'royal-blue',
    price: 7999,
    compareAtPrice: 9999,
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600'],
    stock: 12,
    tags: ['saree', 'silk', 'kanjivaram', 'wedding'],
    rating: 4.8,
    numReviews: 52,
    popularity: 280,
  },
];

(async () => {
  try {
    await connectDB();

    console.log('Clearing existing products and admin users...');
    await Product.deleteMany({});
    await User.deleteMany({ email: 'admin@threadly.test' });

    console.log('Inserting sample products...');
    await Product.insertMany(sampleProducts);

    console.log('Creating admin user (admin@threadly.test / admin12345)...');
    await User.create({
      name: 'Threadly Admin',
      email: 'admin@threadly.test',
      password: 'admin12345',
      role: 'admin',
    });

    console.log('Done.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
