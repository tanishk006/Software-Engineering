const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const subdirs = ['lost-found', 'marketplace', 'complaints', 'avatars'];

subdirs.forEach((dir) => {
  const fullPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'lost-found';
    if (req.baseUrl.includes('marketplace')) {
      folder = 'marketplace';
    } else if (req.baseUrl.includes('complaints')) {
      folder = 'complaints';
    } else if (req.baseUrl.includes('users') || req.baseUrl.includes('auth')) {
      folder = 'avatars';
    }
    cb(null, path.join(uploadsDir, folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTS.includes(ext) ? ext : '.bin';
    const randomHex = crypto.randomBytes(16).toString('hex');
    cb(null, `${file.fieldname}-${randomHex}${safeExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && ALLOWED_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF documents are allowed.');
    err.statusCode = 400;
    cb(err, false);
  }
};

const checkMagicBytes = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size < 4) return null;
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, Math.min(12, stats.size), 0);
    fs.closeSync(fd);

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return 'image/png';
    }
    // PDF: 25 50 44 46 (%PDF)
    if (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    ) {
      return 'application/pdf';
    }
    // WEBP: RIFF .... WEBP
    if (
      stats.size >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return 'image/webp';
    }
  } catch (err) {
    return null;
  }
  return null;
};

const rawUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter
});

const upload = {
  ...rawUpload,
  single: (fieldName) => {
    const middleware = rawUpload.single(fieldName);
    return (req, res, next) => {
      middleware(req, res, (err) => {
        if (err) return next(err);
        if (!req.file) return next();

        const detectedType = checkMagicBytes(req.file.path);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!detectedType || !allowedTypes.includes(detectedType)) {
          if (fs.existsSync(req.file.path)) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (unlinkErr) {
              // Ignore unlink error
            }
          }
          return res.status(400).json({
            success: false,
            message: 'File failed signature validation (magic bytes mismatch). Only authentic JPEG, PNG, WEBP, and PDF files are permitted.'
          });
        }
        next();
      });
    };
  }
};

module.exports = upload;
