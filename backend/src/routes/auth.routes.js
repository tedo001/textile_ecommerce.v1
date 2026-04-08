const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').isString().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }),
  ],
  validate,
  ctrl.register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()],
  validate,
  ctrl.login
);

router.post('/google', body('idToken').isString().notEmpty(), validate, ctrl.googleLogin);

router.get('/me', authenticate, ctrl.me);
router.patch('/me', authenticate, ctrl.updateProfile);

module.exports = router;
