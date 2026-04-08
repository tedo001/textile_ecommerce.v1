const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/admin.controller');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', ctrl.dashboard);

module.exports = router;
