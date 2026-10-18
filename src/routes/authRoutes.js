const express = require('express');
const router = express.Router();
const {registerUser, loginUser, getMe} = require('../controllers/authController');
const {protect} = require('../middleware/authMiddleware');

router.post('/auth/register', registerUser);

router.post('/auth/login', loginUser);

router.get('/me', protect, getMe);

module.exports=router;