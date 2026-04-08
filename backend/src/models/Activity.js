const mongoose = require('mongoose');

// Tracks every user interaction (clicks, views, add-to-cart, purchase, search).
// This is the raw data the Python pipelines consume to build training datasets.
const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // null for guests
    sessionId: { type: String, index: true },
    eventType: {
      type: String,
      enum: ['view', 'click', 'add_to_cart', 'remove_from_cart', 'wishlist', 'purchase', 'search'],
      required: true,
      index: true,
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    query: String,
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Activity', activitySchema);
