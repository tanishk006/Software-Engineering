const campusMapModel = require('../models/campusMapModel');

const getLocations = async (req, res, next) => {
  try {
    const { category } = req.query;
    const locations = await campusMapModel.getCampusLocations(category);
    res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error) {
    next(error);
  }
};

const getLocationDetail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const location = await campusMapModel.getLocationById(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Campus location not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    next(error);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const { name, category, latitude, longitude, description, buildingCode, openingHours } = req.body;

    const locationId = await campusMapModel.createCampusLocation({
      name,
      category: category || 'Academic',
      latitude: Number(latitude),
      longitude: Number(longitude),
      description: description || null,
      buildingCode: buildingCode || null,
      openingHours: openingHours || null
    });

    const created = await campusMapModel.getLocationById(locationId);

    res.status(201).json({
      success: true,
      message: 'Campus pin registered.',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, category, latitude, longitude, description, buildingCode, openingHours } = req.body;

    const existing = await campusMapModel.getLocationById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Campus pin not found.'
      });
    }

    await campusMapModel.updateCampusLocation(id, {
      name,
      category,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      description,
      buildingCode,
      openingHours
    });

    const updated = await campusMapModel.getLocationById(id);

    res.status(200).json({
      success: true,
      message: 'Campus location pin updated.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const removeLocation = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await campusMapModel.getLocationById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Campus pin not found.'
      });
    }

    await campusMapModel.deleteCampusLocation(id);

    res.status(200).json({
      success: true,
      message: 'Campus location pin removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  getLocationDetail,
  createLocation,
  updateLocation,
  removeLocation
};
