const lostFoundModel = require('../models/lostFoundModel');

// ---------------------------------------------------------------------
// Lost Items
// ---------------------------------------------------------------------
const getLostItems = async (req, res, next) => {
  try {
    const { category, status, search, page = 1, limit = 10 } = req.query;

    const result = await lostFoundModel.getLostItems({
      category,
      status,
      search,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getLostItemDetail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await lostFoundModel.getLostItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost item record not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

const reportLostItem = async (req, res, next) => {
  try {
    const { itemName, category, description, dateLost, lostLocation, contactPhone } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/lost-found/${req.file.filename}`;
    }

    const itemId = await lostFoundModel.createLostItem({
      userId: req.user.user_id,
      itemName,
      category,
      description,
      dateLost,
      lostLocation,
      imageUrl,
      contactPhone: contactPhone || req.user.phone || null
    });

    const item = await lostFoundModel.getLostItemById(itemId);

    res.status(201).json({
      success: true,
      message: 'Lost item report submitted.',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

const updateLostStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const existing = await lostFoundModel.getLostItemById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found.'
      });
    }

    if (existing.user_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the reporter or an administrator can update this status.'
      });
    }

    await lostFoundModel.updateLostStatus(id, status);

    res.status(200).json({
      success: true,
      message: `Lost item marked as ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

const removeLostItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await lostFoundModel.getLostItemById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found.'
      });
    }

    if (existing.user_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this lost item report.'
      });
    }

    await lostFoundModel.deleteLostItem(id);

    res.status(200).json({
      success: true,
      message: 'Lost item report removed.'
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------
// Found Items
// ---------------------------------------------------------------------
const getFoundItems = async (req, res, next) => {
  try {
    const { category, status, search, page = 1, limit = 10 } = req.query;

    const result = await lostFoundModel.getFoundItems({
      category,
      status,
      search,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getFoundItemDetail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await lostFoundModel.getFoundItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Found item record not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

const reportFoundItem = async (req, res, next) => {
  try {
    const { itemName, category, description, dateFound, foundLocation, storageLocation } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/lost-found/${req.file.filename}`;
    }

    const itemId = await lostFoundModel.createFoundItem({
      userId: req.user.user_id,
      itemName,
      category,
      description,
      dateFound,
      foundLocation,
      storageLocation: storageLocation || 'Main Campus Security Desk (Gate 1)',
      imageUrl
    });

    const item = await lostFoundModel.getFoundItemById(itemId);

    res.status(201).json({
      success: true,
      message: 'Found item record submitted.',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

const updateFoundStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status, claimedByName } = req.body;

    const existing = await lostFoundModel.getFoundItemById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Found item record not found.'
      });
    }

    if (existing.user_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the finder or an administrator can update this status.'
      });
    }

    await lostFoundModel.updateFoundStatus(id, status, claimedByName || null);

    res.status(200).json({
      success: true,
      message: `Found item marked as ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

const removeFoundItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await lostFoundModel.getFoundItemById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Found item record not found.'
      });
    }

    if (existing.user_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this found item record.'
      });
    }

    await lostFoundModel.deleteFoundItem(id);

    res.status(200).json({
      success: true,
      message: 'Found item record removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLostItems,
  getLostItemDetail,
  reportLostItem,
  updateLostStatus,
  removeLostItem,
  getFoundItems,
  getFoundItemDetail,
  reportFoundItem,
  updateFoundStatus,
  removeFoundItem
};
