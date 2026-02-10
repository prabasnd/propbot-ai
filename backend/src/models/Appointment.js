const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('Appointment', {
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
  leadId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'lead_id'
  },
  agentId: {
    type: DataTypes.UUID,
    field: 'agent_id'
  },
  propertyId: {
    type: DataTypes.STRING,
    field: 'property_id'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'appointment_date'
  },
  appointmentTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'appointment_time'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    field: 'duration_minutes'
  },
  location: {
    type: DataTypes.TEXT
  },
  meetingType: {
    type: DataTypes.STRING(50), // site_visit, office_meeting, virtual
    field: 'meeting_type'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'scheduled'
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'reminder_sent'
  },
  googleCalendarEventId: {
    type: DataTypes.STRING,
    field: 'google_calendar_event_id'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['business_id', 'appointment_date'] },
    { fields: ['lead_id'] }
  ]
});

module.exports = Appointment;
