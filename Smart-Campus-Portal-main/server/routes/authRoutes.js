const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // Strict limiter: 15 attempts per 15 minutes to mitigate brute-force
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

const loginSchema = {
  body: z.object({
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(1, 'Password is required.')
  })
};

const registerSchema = {
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid institutional email.'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    department: z.string().optional(),
    rollNumber: z.string().optional(),
    semester: z.union([z.string(), z.number()]).optional()
  })
};

// Google OAuth
router.post('/google', authLimiter, authController.googleLogin);
router.get('/google/callback', authController.googleOAuthCallback);

// Local Credentials
router.post('/login', authLimiter, validate(loginSchema), authController.loginWithPassword);
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// Profile & Session
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, upload.single('avatar'), authController.updateProfile);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
