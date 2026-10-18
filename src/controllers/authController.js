const User = require('../models/user');
const generateToken = require('../utils/generateToken');

const registerUser = async(req,res) => {
  try{
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });
  }
  catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Security best practice: don't reveal whether email or password was wrong
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

const getMe = async (req, res) => {
  // req.user was populated by protect middleware!
  res.status(200).json({
    status: 'success',
    user: req.user
  });
};

module.exports = {registerUser, loginUser, getMe};