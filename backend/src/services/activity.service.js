const Activity = require('../models/Activity');

// Best-effort activity logging - never throws into the request path.
async function logActivity(req, payload) {
  try {
    await Activity.create({
      user: req.user?._id,
      sessionId: req.headers['x-session-id'] || req.ip,
      ...payload,
    });
  } catch (err) {
    // Swallow - activity logging is non-critical.
  }
}

module.exports = { logActivity };
