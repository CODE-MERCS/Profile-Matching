const jwt = require('jsonwebtoken');

// Set a secure secret key - in production, use environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';

// Generate token
const generateToken = (user) => {
  return jwt.sign({ id: user }, JWT_SECRET, { expiresIn: '1d' });
};

// Verify token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };