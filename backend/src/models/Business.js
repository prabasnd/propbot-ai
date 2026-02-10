const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  industry: {
    type: DataTypes.STRING(100),
    defaultValue: 'real_estate'
  },
  planId: {
    type: DataTypes.UUID,
    field: 'plan_id'
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('trial', 'active', 'suspended', 'cancelled'),
    defaultValue: 'trial',
    field: 'subscription_status'
  },
  razorpayCustomerId: {
    type: DataTypes.STRING,
    field: 'razorpay_customer_id'
  },
  razorpaySubscriptionId: {
    type: DataTypes.STRING,
    field: 'razorpay_subscription_id'
  },
  trialEndsAt: {
    type: DataTypes.DATE,
    field: 'trial_ends_at'
  },
  subscriptionEndsAt: {
    type: DataTypes.DATE,
    field: 'subscription_ends_at'
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'businesses',
  timestamps: true,
  underscored: true
});

module.exports = Business;
