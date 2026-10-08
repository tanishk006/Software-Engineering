const express = require('express');
const { z } = require('zod');
const facultyController = require('../controllers/facultyController');
const authenticate = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');
const validate = require('../middleware/validate');

const facultyRouter = express.Router();
const departmentRouter = express.Router();

const facultySchema = {
  body: z.object({
    fullName: z.string().min(2, 'Full name is required.'),
    email: z.string().email('Valid email is required.'),
    phone: z.string().optional(),
    departmentId: z.union([z.string(), z.number()]),
    designation: z.string().min(2, 'Designation is required.'),
    cabinNumber: z.string().min(1, 'Cabin/Room number is required.'),
    officeHours: z.string().optional(),
    qualification: z.string().optional()
  })
};

facultyRouter.get('/', facultyController.getFacultyList);
facultyRouter.get('/:id', facultyController.getFacultyDetail);

// Admin-only management
facultyRouter.post(
  '/',
  authenticate,
  authorizeRoles('Admin'),
  validate(facultySchema),
  facultyController.createFaculty
);

facultyRouter.put(
  '/:id',
  authenticate,
  authorizeRoles('Admin'),
  facultyController.updateFaculty
);

facultyRouter.delete(
  '/:id',
  authenticate,
  authorizeRoles('Admin'),
  facultyController.removeFaculty
);

// Departments route
departmentRouter.get('/', facultyController.getAllDepartments);

module.exports = {
  facultyRouter,
  departmentRouter
};
