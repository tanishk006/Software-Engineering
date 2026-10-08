const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowed limit of 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  if (err.message && (err.message.includes('file type') || err.message.includes('File failed'))) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'Internal server error occurred.';

  if (res.headersSent) {
    return next(err);
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl} (${statusCode}):`, err.message || err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
