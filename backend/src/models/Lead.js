const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'business_id'
  },
  name: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  source: {
    type: DataTypes.STRING(50) // whatsapp, website, voice, manual
  },
  inquiryType: {
    type: DataTypes.STRING(100), // buy, rent, sell, commercial
    field: 'inquiry_type'
  },
  propertyInterest: {
    type: DataTypes.TEXT,
    field: 'property_interest'
  },
  budgetMin: {
    type: DataTypes.DECIMAL(12, 2),
    field: 'budget_min'
  },
  budgetMax: {
    type: DataTypes.DECIMAL(12, 2),
    field: 'budget_max'
  },
  locationPreference: {
    type: DataTypes.TEXT,
    field: 'location_preference'
  },
  timeline: {
    type: DataTypes.STRING(50) // immediate, 1-3months, 3-6months, 6months+
  },
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'qualified', 'appointment_set', 'converted', 'lost'),
    defaultValue: 'new'
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  temperature: {
    type: DataTypes.ENUM('hot', 'warm', 'cold'),
    defaultValue: 'cold'
  },
  assignedAgentId: {
    type: DataTypes.UUID,
    field: 'assigned_agent_id'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  lastContactAt: {
    type: DataTypes.DATE,
    field: 'last_contact_at'
  }
}, {
  tableName: 'leads',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['business_id', 'status'] },
    { fields: ['phone'] },
    { fields: ['business_id', 'temperature'] }
  ]
});

module.exports = Lead;
