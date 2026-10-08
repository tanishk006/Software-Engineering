const express = require('express');
const { z } = require('zod');
const campusMapController = require('../controllers/campusMapController');
const authenticate = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');
const validate = require('../middleware/validate');

const router = express.Router();

const locationSchema = {
  body: z.object({
    name: z.string().min(2, 'Location name is required.'),
    category: z.enum(['Academic', 'Hostel', 'Administrative', 'Facility', 'Cafeteria', 'Sports', 'Other']).default('Academic'),
    latitude: z.union([z.string(), z.number()]),
    longitude: z.union([z.string(), z.number()]),
    description: z.string().optional(),
    buildingCode: z.string().optional(),
    openingHours: z.string().optional()
  })
};

router.get('/', campusMapController.getLocations);
router.get('/:id', campusMapController.getLocationDetail);

router.post(
  '/',
  authenticate,
  authorizeRoles('Admin'),
  validate(locationSchema),
  campusMapController.createLocation
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Admin'),
  campusMapController.updateLocation
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Admin'),
  campusMapController.removeLocation
);

module.exports = router;
