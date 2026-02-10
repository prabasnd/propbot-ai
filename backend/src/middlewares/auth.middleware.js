const jwt = require('jsonwebtoken');
const { User, Business } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Business, as: 'business' }]
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid authentication token' }
      });
    }

    // Check subscription status
    if (user.business.subscriptionStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        error: { message: 'Subscription suspended. Please update payment details.' }
      });
    }

    req.user = user;
    req.businessId = user.businessId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid authentication token' }
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' }
      });
    }
    next();
  };
};

module.exports = { auth, requireRole };
