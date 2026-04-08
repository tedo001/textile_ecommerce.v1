const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activity.service');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.json({ cart: cart || { items: [] } });
});

exports.addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => i.product.equals(productId));
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  await cart.populate('items.product');

  logActivity(req, { eventType: 'add_to_cart', product: productId, metadata: { quantity } }).catch(
    () => {}
  );

  res.json({ cart });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, 'Cart not found');
  const item = cart.items.find((i) => i.product.equals(productId));
  if (!item) throw new ApiError(404, 'Item not in cart');
  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => !i.product.equals(productId));
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  await cart.populate('items.product');
  res.json({ cart });
});

exports.removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, 'Cart not found');
  cart.items = cart.items.filter((i) => !i.product.equals(req.params.productId));
  await cart.save();
  await cart.populate('items.product');
  logActivity(req, { eventType: 'remove_from_cart', product: req.params.productId }).catch(
    () => {}
  );
  res.json({ cart });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { items: [] });
  res.json({ ok: true });
});
