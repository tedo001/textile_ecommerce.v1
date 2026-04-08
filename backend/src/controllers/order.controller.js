const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activity.service');

exports.placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'cod' } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const items = cart.items.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    image: i.product.images?.[0],
    price: i.product.price,
    quantity: i.quantity,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = subtotal > 999 ? 0 : 49;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + shippingCost + tax).toFixed(2);

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCost,
    tax,
    total,
  });

  // Decrement stock and bump popularity
  await Promise.all(
    items.map((i) =>
      Product.updateOne(
        { _id: i.product },
        { $inc: { stock: -i.quantity, popularity: i.quantity * 3 } }
      )
    )
  );

  // Empty the cart
  cart.items = [];
  await cart.save();

  // Log purchases for ML
  for (const i of items) {
    logActivity(req, {
      eventType: 'purchase',
      product: i.product,
      metadata: { quantity: i.quantity, price: i.price },
    }).catch(() => {});
  }

  res.status(201).json({ order });
});

exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (!order.user.equals(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden');
  }
  res.json({ order });
});

exports.allOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().sort('-createdAt').populate('user', 'name email');
  res.json({ orders });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ order });
});
