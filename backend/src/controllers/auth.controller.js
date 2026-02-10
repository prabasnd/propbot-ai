const jwt = require('jsonwebtoken');
const { User, Business } = require('../models');
const { addDays } = require('date-fns');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async (req, res) => {
  try {
    const { businessName, email, password, phone, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email already registered' }
      });
    }

    // Create business
    const business = await Business.create({
      name: businessName,
      email,
      phone,
      subscriptionStatus: 'trial',
      trialEndsAt: addDays(new Date(), 14) // 14-day trial
    });

    // Create admin user
    const user = await User.create({
      businessId: business.id,
      name: name || businessName,
      email,
      passwordHash: password,
      role: 'admin'
    });

    const token = generateToken(user.id);

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        business: {
          id: business.id,
          name: business.name,
          subscriptionStatus: business.subscriptionStatus,
          trialEndsAt: business.trialEndsAt
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Registration failed' }
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Business, as: 'business' }]
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    const token = generateToken(user.id);

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        business: {
          id: user.business.id,
          name: user.business.name,
          subscriptionStatus: user.business.subscriptionStatus,
          trialEndsAt: user.business.trialEndsAt
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Login failed' }
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Business, as: 'business' }],
      attributes: { exclude: ['passwordHash'] }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user data' }
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
