const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} →`, err.stack || err.message);
  }
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      details: err.details,
    },
  });
};
