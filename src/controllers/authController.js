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

module.exports = {registerUser};