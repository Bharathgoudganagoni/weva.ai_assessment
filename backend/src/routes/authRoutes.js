const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public auth endpoints
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected auth endpoint
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
