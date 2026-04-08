const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');
const ml = require('../services/ml.service');

exports.dashboard = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [productCount, userCount, orderCount, revenueAgg, topProducts, dailyActivity] =
    await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: { $in: ['paid', 'pending'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            qty: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { qty: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $project: {
            name: '$product.name',
            slug: '$product.slug',
            qty: 1,
            revenue: 1,
          },
        },
      ]),
      Activity.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              type: '$eventType',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.day': 1 } },
      ]),
    ]);

  const mlMetrics = await ml.metrics();

  res.json({
    summary: {
      products: productCount,
      users: userCount,
      orders: orderCount,
      revenue: revenueAgg[0]?.total || 0,
    },
    topProducts,
    dailyActivity,
    mlMetrics,
  });
});
