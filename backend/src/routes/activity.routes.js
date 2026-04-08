const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/activity.controller');

const router = express.Router();

router.post('/track', optionalAuth, ctrl.track);
router.get('/me', authenticate, ctrl.recent);

module.exports = router;
