// Wraps async route handlers and forwards rejections to Express's error middleware.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
