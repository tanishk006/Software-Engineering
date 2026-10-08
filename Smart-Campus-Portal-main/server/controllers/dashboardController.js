const dashboardModel = require('../models/dashboardModel');

const getDashboardData = async (req, res, next) => {
  try {
    const data = await dashboardModel.getDashboardStats(req.user);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData
};
