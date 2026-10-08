const complaintModel = require('../models/complaintModel');

const getComplaints = async (req, res, next) => {
  try {
    const { status, complaintType, search, page = 1, limit = 10, viewScope } = req.query;

    let studentId = undefined;
    let assignedTo = undefined;

    // Student only sees their own complaints
    if (req.user.role === 'Student') {
      studentId = req.user.user_id;
    } else if (req.user.role === 'Staff' && viewScope === 'assigned') {
      assignedTo = req.user.user_id;
    }

    const result = await complaintModel.getComplaints({
      studentId,
      assignedTo,
      status,
      complaintType,
      search,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      data: result.complaints,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getComplaintDetail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const complaint = await complaintModel.getComplaintById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.'
      });
    }

    // Permission check: Students can only view their own complaint
    if (req.user.role === 'Student' && complaint.student_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this complaint.'
      });
    }

    // Load audit history
    const history = await complaintModel.getComplaintHistory(id);

    res.status(200).json({
      success: true,
      data: {
        ...complaint,
        history
      }
    });
  } catch (error) {
    next(error);
  }
};

const submitComplaint = async (req, res, next) => {
  try {
    const { complaintType, title, description, location } = req.body;

    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = `/uploads/complaints/${req.file.filename}`;
    }

    const complaintId = await complaintModel.createComplaint({
      studentId: req.user.user_id,
      complaintType,
      title,
      description,
      location,
      attachmentUrl
    });

    const created = await complaintModel.getComplaintById(complaintId);

    res.status(201).json({
      success: true,
      message: 'Complaint ticket submitted.',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

const assignComplaint = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { assignedTo, remarks } = req.body;

    const existing = await complaintModel.getComplaintById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.'
      });
    }

    await complaintModel.assignComplaint(
      id,
      Number(assignedTo),
      req.user.user_id,
      remarks || 'Ticket assigned for on-site inspection.'
    );

    const updated = await complaintModel.getComplaintById(id);
    const history = await complaintModel.getComplaintHistory(id);

    res.status(200).json({
      success: true,
      message: 'Complaint successfully assigned.',
      data: {
        ...updated,
        history
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status, remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({
        success: false,
        message: 'A status update remark is required for accountability.'
      });
    }

    const existing = await complaintModel.getComplaintById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.'
      });
    }

    await complaintModel.updateStatusWithHistory(
      id,
      status,
      req.user.user_id,
      remarks
    );

    const updated = await complaintModel.getComplaintById(id);
    const history = await complaintModel.getComplaintHistory(id);

    res.status(200).json({
      success: true,
      message: `Complaint ticket marked as ${status}.`,
      data: {
        ...updated,
        history
      }
    });
  } catch (error) {
    next(error);
  }
};

const removeComplaint = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await complaintModel.getComplaintById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.'
      });
    }

    if (existing.student_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this complaint.'
      });
    }

    await complaintModel.deleteComplaint(id);

    res.status(200).json({
      success: true,
      message: 'Complaint record removed.'
    });
  } catch (error) {
    next(error);
  }
};

const getStaffList = async (req, res, next) => {
  try {
    const staff = await complaintModel.getStaffMembers();
    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaintDetail,
  submitComplaint,
  assignComplaint,
  updateStatus,
  removeComplaint,
  getStaffList
};
