const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activity.service');

// Frontend can fire-and-forget client-side events (e.g. card clicks).
exports.track = asyncHandler(async (req, res) => {
  const { eventType, productId, query, metadata } = req.body;
  if (!eventType) return res.status(400).json({ error: 'eventType is required' });
  await logActivity(req, { eventType, product: productId, query, metadata });
  res.status(202).json({ ok: true });
});

exports.recent = asyncHandler(async (req, res) => {
  const items = await Activity.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(50)
    .populate('product', 'name slug images price');
  res.json({ items });
});
