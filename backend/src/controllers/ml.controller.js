const mongoose = require('mongoose');
const multer = require('multer');
const FormData = require('form-data');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ml = require('../services/ml.service');

// Filter out anything that isn't a valid ObjectId so Product.find doesn't throw.
// (Synthetic ids returned by an untrained model can't be cast.)
const isObjectId = (s) => typeof s === 'string' && mongoose.Types.ObjectId.isValid(s);

// Backend acts as a thin proxy to the ML service so the frontend never needs
// to know its location and so we can mix in DB lookups (e.g. hydrate product ids
// returned by the model into full product documents).

exports.recommend = asyncHandler(async (req, res) => {
  const userId = req.user?._id?.toString();
  const productId = req.query.productId || undefined;
  const k = Number(req.query.k || 8);

  const result = await ml.recommend({ userId, productId, k });
  const ids = (result.items || []).map((i) => i.product_id || i).filter(isObjectId);
  const products = ids.length
    ? await Product.find({ _id: { $in: ids }, isActive: true })
    : [];
  // Preserve ranking from ML
  const ordered = ids.map((id) => products.find((p) => p._id.toString() === id)).filter(Boolean);

  // Cold-start fallback so the storefront always has *something* to show
  if (!ordered.length) {
    const popular = await Product.find({ isActive: true }).sort('-popularity').limit(k);
    return res.json({ items: popular, fallback: 'popularity' });
  }
  res.json({ items: ordered });
});

exports.predictDemand = asyncHandler(async (req, res) => {
  const result = await ml.predictDemand({
    productId: req.params.productId,
    horizonDays: Number(req.query.horizon || 7),
  });
  res.json(result);
});

exports.detectReview = asyncHandler(async (req, res) => {
  const result = await ml.detectReview({ text: req.body.text });
  res.json(result);
});

exports.metrics = asyncHandler(async (_req, res) => {
  res.json(await ml.metrics());
});

// Image search proxy
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });
exports.uploadMiddleware = upload.single('image');

exports.imageSearch = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image is required' });
  // Forward the binary as multipart to the ML service
  const fd = new FormData();
  fd.append('image', req.file.buffer, { filename: req.file.originalname || 'upload.jpg' });
  const result = await ml.imageSearch(fd, fd.getHeaders());
  const ids = (result.items || []).map((i) => i.product_id).filter(isObjectId);
  const products = ids.length
    ? await Product.find({ _id: { $in: ids }, isActive: true })
    : [];
  const ordered = ids.map((id) => products.find((p) => p._id.toString() === id)).filter(Boolean);
  res.json({ items: ordered });
});
