const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  leadId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'lead_id'
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'business_id'
  },
  channel: {
    type: DataTypes.STRING(50),
    allowNull: false // whatsapp, sms, voice, webchat
  },
  direction: {
    type: DataTypes.STRING(20) // inbound, outbound
  },
  sender: {
    type: DataTypes.STRING(50) // ai, agent, lead
  },
  message: {
    type: DataTypes.TEXT
  },
  voiceTranscript: {
    type: DataTypes.TEXT,
    field: 'voice_transcript'
  },
  voiceRecordingUrl: {
    type: DataTypes.STRING(500),
    field: 'voice_recording_url'
  },
  durationSeconds: {
    type: DataTypes.INTEGER,
    field: 'duration_seconds'
  },
  aiMetadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'ai_metadata'
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'delivered' // pending, delivered, read, failed
  },
  twilioMessageSid: {
    type: DataTypes.STRING,
    field: 'twilio_message_sid'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'conversations',
  timestamps: false,
  indexes: [
    { fields: ['lead_id', 'timestamp'] },
    { fields: ['business_id', 'timestamp'] }
  ]
});

module.exports = Conversation;
