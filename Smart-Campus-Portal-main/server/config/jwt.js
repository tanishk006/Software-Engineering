require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.trim() === '') {
  throw new Error(
    'FATAL SECURITY CONFIGURATION: JWT_SECRET is missing. Server cannot start securely without an explicit secret key.'
  );
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken
};
