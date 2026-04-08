const Product = require('../models/Product');
const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activity.service');

exports.list = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    page = 1,
    limit = 20,
  } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) filter.$text = { $search: q };

  const sortMap = {
    popular: '-popularity',
    rating: '-rating',
    priceAsc: 'price',
    priceDesc: '-price',
    newest: '-createdAt',
  };
  const sortBy = sortMap[sort] || sort;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  if (q) {
    logActivity(req, { eventType: 'search', query: q }).catch(() => {});
  }

  res.json({
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new ApiError(404, 'Product not found');
  // increment popularity counter and log view
  Product.updateOne({ _id: product._id }, { $inc: { popularity: 1 } }).catch(() => {});
  logActivity(req, { eventType: 'view', product: product._id }).catch(() => {});
  res.json({ product });
});

exports.getById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ product });
});

exports.create = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ product });
});

exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ ok: true });
});

exports.trending = asyncHandler(async (_req, res) => {
  // Aggregates the last 30 days of activity to surface trending products quickly,
  // while the ML service can refine this with proper demand forecasting.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const trending = await Activity.aggregate([
    { $match: { createdAt: { $gte: since }, product: { $ne: null } } },
    { $group: { _id: '$product', score: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 12 },
  ]);
  const ids = trending.map((t) => t._id);
  const products = await Product.find({ _id: { $in: ids }, isActive: true });
  const ordered = ids
    .map((id) => products.find((p) => p._id.equals(id)))
    .filter(Boolean);
  res.json({ items: ordered });
});
