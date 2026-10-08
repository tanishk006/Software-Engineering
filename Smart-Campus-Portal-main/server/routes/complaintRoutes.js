const express = require('express');
const { z } = require('zod');
const complaintController = require('../controllers/complaintController');
const authenticate = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

const complaintSchema = {
  body: z.object({
    complaintType: z.string().min(2, 'Complaint category is required.'),
    title: z.string().min(3, 'Title is required.'),
    description: z.string().min(10, 'Please describe the issue in at least 10 characters.'),
    location: z.string().min(2, 'Location is required.')
  })
};

const statusSchema = {
  body: z.object({
    status: z.enum(['Open', 'In Progress', 'Resolved', 'Rejected']),
    remarks: z.string().min(2, 'Remark is mandatory for status changes.')
  })
};

const assignSchema = {
  body: z.object({
    assignedTo: z.union([z.string(), z.number()]),
    remarks: z.string().optional()
  })
};

router.get('/', authenticate, complaintController.getComplaints);
router.get('/staff-list', authenticate, complaintController.getStaffList);
router.get('/:id', authenticate, complaintController.getComplaintDetail);

router.post(
  '/',
  authenticate,
  upload.single('attachment'),
  validate(complaintSchema),
  complaintController.submitComplaint
);

// Admin-only assignment workflow
router.patch(
  '/:id/assign',
  authenticate,
  authorizeRoles('Admin'),
  validate(assignSchema),
  complaintController.assignComplaint
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('Admin', 'Staff'),
  validate(statusSchema),
  complaintController.updateStatus
);

router.delete('/:id', authenticate, complaintController.removeComplaint);

module.exports = router;
