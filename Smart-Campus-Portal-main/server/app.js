require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const eventRoutes = require('./routes/eventRoutes');
const { lostRouter, foundRouter } = require('./routes/lostFoundRoutes');
const { facultyRouter, departmentRouter } = require('./routes/facultyRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const emergencyContactRoutes = require('./routes/emergencyContactRoutes');
const campusMapRoutes = require('./routes/campusMapRoutes');

const app = express();

// Trust reverse proxy headers (Nginx, Cloudflare, AWS ALB) for accurate client IP detection & rate limiting
app.set('trust proxy', 1);

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:3000'
];

const envAllowed = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowed]));

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // In development, dynamically allow any localhost or 127.0.0.1 port
  if (process.env.NODE_ENV !== 'production') {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return true;
    }
  }
  return false;
};

// Security headers with production-safe CSP for Leaflet maps, fonts, and OAuth
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https:', 'http:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        fontSrc: ["'self'", 'https:', 'data:']
      }
    }
  })
);

// CORS restricted to frontend origin
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Blocked by CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  })
);

// Global API Rate Limiter
const rateLimit = require('express-rate-limit');
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api', globalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory with strict security headers
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    dotfiles: 'ignore',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'");
    }
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Campus Portal API is healthy and operational.',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/lost-items', lostRouter);
app.use('/api/found-items', foundRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/emergency-contacts', emergencyContactRoutes);
app.use('/api/campus-map', campusMapRoutes);

// Serve static frontend build in production if available
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 Handler for API and unmatched requests
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
