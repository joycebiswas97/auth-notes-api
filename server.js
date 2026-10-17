
require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const User = require('./src/models/user'); 
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectDB();

app.use('/api', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Auth & Notes API' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});