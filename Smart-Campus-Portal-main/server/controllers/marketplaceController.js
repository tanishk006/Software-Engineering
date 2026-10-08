const marketplaceModel = require('../models/marketplaceModel');

const getItems = async (req, res, next) => {
  try {
    const { category, status = 'Available', search, minPrice, maxPrice, page = 1, limit = 9 } = req.query;

    const result = await marketplaceModel.getMarketplaceItems({
      category,
      status,
      search,
      minPrice,
      maxPrice,
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

const getItemDetail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await marketplaceModel.getMarketplaceItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Product listing not found.'
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

const createListing = async (req, res, next) => {
  try {
    const { productName, category, price, description, conditionType, contactPhone } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/marketplace/${req.file.filename}`;
    }

    const productId = await marketplaceModel.createMarketplaceItem({
      sellerId: req.user.user_id,
      productName,
      category,
      price: Number(price),
      description,
      conditionType: conditionType || 'Good',
      imageUrl,
      contactPhone: contactPhone || req.user.phone || null
    });

    const item = await marketplaceModel.getMarketplaceItemById(productId);

    res.status(201).json({
      success: true,
      message: 'Product listing published.',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await marketplaceModel.getMarketplaceItemById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.'
      });
    }

    if (existing.seller_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing.'
      });
    }

    const { productName, category, price, description, conditionType, contactPhone } = req.body;

    let imageUrl = undefined;
    if (req.file) {
      imageUrl = `/uploads/marketplace/${req.file.filename}`;
    }

    await marketplaceModel.updateMarketplaceItem(id, {
      productName,
      category,
      price: price ? Number(price) : undefined,
      description,
      conditionType,
      imageUrl,
      contactPhone
    });

    const updated = await marketplaceModel.getMarketplaceItemById(id);

    res.status(200).json({
      success: true,
      message: 'Listing updated.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const updateListingStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const existing = await marketplaceModel.getMarketplaceItemById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.'
      });
    }

    if (existing.seller_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing.'
      });
    }

    await marketplaceModel.updateMarketplaceStatus(id, status);

    res.status(200).json({
      success: true,
      message: `Product marked as ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

const removeListing = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await marketplaceModel.getMarketplaceItemById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.'
      });
    }

    if (existing.seller_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing.'
      });
    }

    await marketplaceModel.deleteMarketplaceItem(id);

    res.status(200).json({
      success: true,
      message: 'Listing removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemDetail,
  createListing,
  updateListing,
  updateListingStatus,
  removeListing
};
