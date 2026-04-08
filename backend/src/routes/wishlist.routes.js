const express = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/wishlist.controller');

const router = express.Router();
router.use(authenticate);

router.get('/', ctrl.get);
router.post('/toggle', ctrl.toggle);

module.exports = router;
