const express = require('express');
const { z } = require('zod');
const eventController = require('../controllers/eventController');
const authenticate = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

const eventBodySchema = {
  body: z.object({
    title: z.string().min(3, 'Event title must be at least 3 characters.'),
    description: z.string().min(10, 'Description must be at least 10 characters.'),
    category: z.string().min(2, 'Category is required.'),
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Event date must be in YYYY-MM-DD format.'),
    eventTime: z.string().min(4, 'Event time is required.'),
    venue: z.string().min(2, 'Venue is required.'),
    registrationLink: z.string().url('Invalid registration URL.').optional().or(z.literal('')),
    maxSeats: z.union([z.string(), z.number()]).optional()
  })
};

// Optional auth reader for RSVP state
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, eventController.getAllEvents);
router.get('/:id', optionalAuth, eventController.getEventDetail);

// Admin and Faculty can create events per SRS
router.post(
  '/',
  authenticate,
  authorizeRoles('Admin', 'Faculty'),
  upload.single('image'),
  validate(eventBodySchema),
  eventController.createNewEvent
);

router.put(
  '/:id',
  authenticate,
  upload.single('image'),
  eventController.updateExistingEvent
);

router.delete('/:id', authenticate, eventController.removeEvent);

// RSVP / Event Registration
router.post('/:id/register', authenticate, eventController.rsvpEvent);
router.delete('/:id/register', authenticate, eventController.cancelRsvpEvent);

module.exports = router;
