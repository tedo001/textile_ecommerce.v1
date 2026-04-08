const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/review.controller');

const router = express.Router();

router.get('/product/:productId', ctrl.list);

router.post(
  '/product/:productId',
  authenticate,
  [body('rating').isInt({ min: 1, max: 5 }), body('body').isString().isLength({ min: 5 })],
  validate,
  ctrl.create
);

router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;
