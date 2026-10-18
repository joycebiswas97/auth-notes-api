const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and begins with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Extract token string (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify token signature against JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user by decoded ID, excluding the password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ error: 'User belonging to this token no longer exists' });
      }

      // 5. User verified successfully, pass control to the actual controller
      return next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
    }
  }

  // 6. Header was missing or improperly formatted
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };