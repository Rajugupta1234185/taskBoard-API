const express = require('express');
const router = express.Router();
const { register, login, logout, sessionInfo } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', authenticate, logout);
router.get('/session-info', authenticate, sessionInfo);

module.exports = router;
