const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/ml.controller');

const router = express.Router();

router.get('/recommend', optionalAuth, ctrl.recommend);
router.get('/predict-demand/:productId', ctrl.predictDemand);
router.post('/detect-review', ctrl.detectReview);
router.post('/image-search', ctrl.uploadMiddleware, ctrl.imageSearch);
router.get('/metrics', ctrl.metrics);

module.exports = router;
