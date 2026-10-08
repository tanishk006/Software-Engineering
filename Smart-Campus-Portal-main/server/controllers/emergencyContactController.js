const emergencyContactModel = require('../models/emergencyContactModel');

const getContacts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const contacts = await emergencyContactModel.getEmergencyContacts(category);
    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

const getContactDetail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const contact = await emergencyContactModel.getContactById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact record not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const { departmentName, contactPerson, phoneNumber, email, category, is24x7 } = req.body;

    const contactId = await emergencyContactModel.createEmergencyContact({
      departmentName,
      contactPerson,
      phoneNumber,
      email: email || null,
      category: category || 'Security',
      is24x7: is24x7 !== undefined ? is24x7 : 1
    });

    const created = await emergencyContactModel.getContactById(contactId);

    res.status(201).json({
      success: true,
      message: 'Emergency contact published.',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { departmentName, contactPerson, phoneNumber, email, category, is24x7 } = req.body;

    const existing = await emergencyContactModel.getContactById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found.'
      });
    }

    await emergencyContactModel.updateEmergencyContact(id, {
      departmentName,
      contactPerson,
      phoneNumber,
      email,
      category,
      is24x7
    });

    const updated = await emergencyContactModel.getContactById(id);

    res.status(200).json({
      success: true,
      message: 'Emergency contact updated.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await emergencyContactModel.getContactById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found.'
      });
    }

    await emergencyContactModel.deleteEmergencyContact(id);

    res.status(200).json({
      success: true,
      message: 'Emergency contact entry removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  getContactDetail,
  createContact,
  updateContact,
  removeContact
};
