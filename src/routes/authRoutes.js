const express = require('express');
const router = express.Router();
const {registerUser} = require('../controllers/authController');

router.post('/auth/register', registerUser);

module.exports=router;