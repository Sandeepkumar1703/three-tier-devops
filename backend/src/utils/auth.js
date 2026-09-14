const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (user) => jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
  expiresIn: config.jwtExpiresIn,
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = { generateToken, authenticate };
