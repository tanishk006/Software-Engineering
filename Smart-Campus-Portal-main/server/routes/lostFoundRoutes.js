const express = require('express');
const { z } = require('zod');
const lostFoundController = require('../controllers/lostFoundController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const lostRouter = express.Router();
const foundRouter = express.Router();

const lostSchema = {
  body: z.object({
    itemName: z.string().min(2, 'Item name is required.'),
    category: z.string().min(2, 'Category is required.'),
    description: z.string().min(5, 'Description is required.'),
    dateLost: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date is required (YYYY-MM-DD).'),
    lostLocation: z.string().min(2, 'Lost location is required.'),
    contactPhone: z.string().optional()
  })
};

const foundSchema = {
  body: z.object({
    itemName: z.string().min(2, 'Item name is required.'),
    category: z.string().min(2, 'Category is required.'),
    description: z.string().min(5, 'Description is required.'),
    dateFound: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date is required (YYYY-MM-DD).'),
    foundLocation: z.string().min(2, 'Found location is required.'),
    storageLocation: z.string().optional()
  })
};

// Lost items routes
lostRouter.get('/', lostFoundController.getLostItems);
lostRouter.get('/:id', lostFoundController.getLostItemDetail);
lostRouter.post(
  '/',
  authenticate,
  upload.single('image'),
  validate(lostSchema),
  lostFoundController.reportLostItem
);
lostRouter.patch('/:id/status', authenticate, lostFoundController.updateLostStatus);
lostRouter.delete('/:id', authenticate, lostFoundController.removeLostItem);

// Found items routes
foundRouter.get('/', lostFoundController.getFoundItems);
foundRouter.get('/:id', lostFoundController.getFoundItemDetail);
foundRouter.post(
  '/',
  authenticate,
  upload.single('image'),
  validate(foundSchema),
  lostFoundController.reportFoundItem
);
foundRouter.patch('/:id/status', authenticate, lostFoundController.updateFoundStatus);
foundRouter.delete('/:id', authenticate, lostFoundController.removeFoundItem);

module.exports = {
  lostRouter,
  foundRouter
};
