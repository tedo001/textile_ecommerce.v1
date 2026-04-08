const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/product.controller');

const router = express.Router();

router.get('/', optionalAuth, ctrl.list);
router.get('/trending', ctrl.trending);
router.get('/slug/:slug', optionalAuth, ctrl.getBySlug);
router.get('/:id', ctrl.getById);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  [
    body('name').isString().notEmpty(),
    body('slug').isString().notEmpty(),
    body('category').isString().notEmpty(),
    body('price').isFloat({ min: 0 }),
  ],
  validate,
  ctrl.create
);

router.patch('/:id', authenticate, requireRole('admin'), ctrl.update);
router.delete('/:id', authenticate, requireRole('admin'), ctrl.remove);

module.exports = router;
