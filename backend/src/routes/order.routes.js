const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/order.controller');

const router = express.Router();
router.use(authenticate);

router.post('/', ctrl.placeOrder);
router.get('/me', ctrl.myOrders);
router.get('/all', requireRole('admin'), ctrl.allOrders);
router.get('/:id', ctrl.getOrder);
router.patch('/:id/status', requireRole('admin'), ctrl.updateStatus);

module.exports = router;
