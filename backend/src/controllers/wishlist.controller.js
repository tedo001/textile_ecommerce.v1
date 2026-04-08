const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activity.service');

async function getOrCreate(userId) {
  let list = await Wishlist.findOne({ user: userId });
  if (!list) list = await Wishlist.create({ user: userId, products: [] });
  return list;
}

exports.get = asyncHandler(async (req, res) => {
  const list = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.json({ wishlist: list || { products: [] } });
});

exports.toggle = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const list = await getOrCreate(req.user._id);
  const idx = list.products.findIndex((p) => p.equals(productId));
  if (idx >= 0) {
    list.products.splice(idx, 1);
  } else {
    list.products.push(productId);
    logActivity(req, { eventType: 'wishlist', product: productId }).catch(() => {});
  }
  await list.save();
  await list.populate('products');
  res.json({ wishlist: list });
});
