const express = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/cart.controller');

const router = express.Router();
router.use(authenticate);

router.get('/', ctrl.getCart);
router.post('/items', ctrl.addItem);
router.patch('/items', ctrl.updateItem);
router.delete('/items/:productId', ctrl.removeItem);
router.delete('/', ctrl.clearCart);

module.exports = router;
