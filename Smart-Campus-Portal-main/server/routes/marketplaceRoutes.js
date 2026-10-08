const express = require('express');
const { z } = require('zod');
const marketplaceController = require('../controllers/marketplaceController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

const itemSchema = {
  body: z.object({
    productName: z.string().min(2, 'Product name is required.'),
    category: z.string().min(2, 'Category is required.'),
    price: z.union([z.string(), z.number()]),
    description: z.string().min(5, 'Description is required.'),
    conditionType: z.enum(['Like New', 'Good', 'Fair', 'Refurbished']).optional(),
    contactPhone: z.string().optional()
  })
};

router.get('/', marketplaceController.getItems);
router.get('/:id', marketplaceController.getItemDetail);

router.post(
  '/',
  authenticate,
  upload.single('image'),
  validate(itemSchema),
  marketplaceController.createListing
);

router.put(
  '/:id',
  authenticate,
  upload.single('image'),
  marketplaceController.updateListing
);

router.patch('/:id/status', authenticate, marketplaceController.updateListingStatus);
router.delete('/:id', authenticate, marketplaceController.removeListing);

module.exports = router;
