const Review = require('../models/Review');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const ml = require('../services/ml.service');

exports.list = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.json({ reviews });
});

exports.create = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, body } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  // Score the review with the ML fake-detector
  const detection = await ml.detectReview({ text: `${title || ''} ${body}` });

  const review = await Review.findOneAndUpdate(
    { product: productId, user: req.user._id },
    {
      product: productId,
      user: req.user._id,
      rating,
      title,
      body,
      fakeScore: detection.fake_score ?? 0,
      isFlagged: !!detection.is_fake,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Recompute aggregate rating from non-flagged reviews
  const stats = await Review.aggregate([
    { $match: { product: product._id, isFlagged: false } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats[0]) {
    product.rating = +stats[0].avg.toFixed(2);
    product.numReviews = stats[0].count;
    await product.save();
  }

  res.status(201).json({ review });
});

exports.remove = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (!review.user.equals(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden');
  }
  await review.deleteOne();
  res.json({ ok: true });
});
