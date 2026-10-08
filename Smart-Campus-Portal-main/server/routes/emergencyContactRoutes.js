const express = require('express');
const { z } = require('zod');
const emergencyContactController = require('../controllers/emergencyContactController');
const authenticate = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');
const validate = require('../middleware/validate');

const router = express.Router();

const contactSchema = {
  body: z.object({
    departmentName: z.string().min(2, 'Department name is required.'),
    contactPerson: z.string().min(2, 'Contact person is required.'),
    phoneNumber: z.string().min(3, 'Phone number is required.'),
    email: z.string().email('Valid email is required.').optional().or(z.literal('')),
    category: z.enum(['Security', 'Medical', 'Fire', 'Helpline', 'Other']).default('Security'),
    is24x7: z.union([z.boolean(), z.number()]).optional()
  })
};

router.get('/', emergencyContactController.getContacts);
router.get('/:id', emergencyContactController.getContactDetail);

router.post(
  '/',
  authenticate,
  authorizeRoles('Admin'),
  validate(contactSchema),
  emergencyContactController.createContact
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Admin'),
  emergencyContactController.updateContact
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Admin'),
  emergencyContactController.removeContact
);

module.exports = router;
