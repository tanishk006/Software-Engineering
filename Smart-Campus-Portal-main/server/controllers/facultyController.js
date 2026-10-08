const facultyModel = require('../models/facultyModel');
const departmentModel = require('../models/departmentModel');
const userModel = require('../models/userModel');

const getFacultyList = async (req, res, next) => {
  try {
    const { departmentId, search, page = 1, limit = 12 } = req.query;

    const result = await facultyModel.getFacultyList({
      departmentId,
      search,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      data: result.faculty,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getFacultyDetail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const faculty = await facultyModel.getFacultyById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await departmentModel.getAllDepartments();
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

const createFaculty = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      departmentId,
      designation,
      cabinNumber,
      officeHours,
      qualification
    } = req.body;

    let user = await userModel.findByEmail(email);
    let userId;

    if (!user) {
      userId = await userModel.createUser({
        fullName,
        email,
        phone,
        role: 'Faculty'
      });
    } else {
      userId = user.user_id;
    }

    const facultyId = await userModel.createFaculty({
      userId,
      departmentId: Number(departmentId),
      designation,
      cabinNumber,
      officeHours: officeHours || null,
      qualification: qualification || null
    });

    const created = await facultyModel.getFacultyById(facultyId);

    res.status(201).json({
      success: true,
      message: 'Faculty member added successfully.',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

const updateFaculty = async (req, res, next) => {
  try {
    const facultyId = Number(req.params.id);
    const {
      departmentId,
      designation,
      cabinNumber,
      officeHours,
      qualification,
      fullName,
      phone
    } = req.body;

    const existing = await facultyModel.getFacultyById(facultyId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found.'
      });
    }

    await facultyModel.updateFacultyEntry(facultyId, {
      departmentId: departmentId ? Number(departmentId) : undefined,
      designation,
      cabinNumber,
      officeHours,
      qualification
    });

    if (fullName || phone) {
      await userModel.updateProfile(existing.user_id, {
        fullName,
        phone
      });
    }

    const updated = await facultyModel.getFacultyById(facultyId);

    res.status(200).json({
      success: true,
      message: 'Faculty information updated.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const removeFaculty = async (req, res, next) => {
  try {
    const facultyId = Number(req.params.id);
    const existing = await facultyModel.getFacultyById(facultyId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found.'
      });
    }

    await facultyModel.deleteFacultyEntry(facultyId);

    res.status(200).json({
      success: true,
      message: 'Faculty member entry removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFacultyList,
  getFacultyDetail,
  getAllDepartments,
  createFaculty,
  updateFaculty,
  removeFaculty
};
