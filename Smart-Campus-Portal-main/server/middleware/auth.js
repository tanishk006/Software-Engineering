const { verifyToken } = require('../config/jwt');
const { query } = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_MISSING',
        message: 'Authentication token missing or invalid format.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_MISSING',
        message: 'Authentication token is required.'
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Session has expired or token is invalid. Please log in again.'
      });
    }

    const users = await query(
      'SELECT user_id, full_name, email, role, phone, avatar_url, is_active FROM users WHERE user_id = ? LIMIT 1',
      [decoded.user_id]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User account no longer exists.'
      });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
