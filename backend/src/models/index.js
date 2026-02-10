const Business = require('./Business');
const User = require('./User');
const Lead = require('./Lead');
const Conversation = require('./Conversation');
const Appointment = require('./Appointment');

// Define associations
Business.hasMany(User, { foreignKey: 'businessId', as: 'users' });
User.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

Business.hasMany(Lead, { foreignKey: 'businessId', as: 'leads' });
Lead.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

Lead.belongsTo(User, { foreignKey: 'assignedAgentId', as: 'assignedAgent' });
User.hasMany(Lead, { foreignKey: 'assignedAgentId', as: 'assignedLeads' });

Lead.hasMany(Conversation, { foreignKey: 'leadId', as: 'conversations' });
Conversation.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

Business.hasMany(Conversation, { foreignKey: 'businessId', as: 'conversations' });
Conversation.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

Lead.hasMany(Appointment, { foreignKey: 'leadId', as: 'appointments' });
Appointment.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

Business.hasMany(Appointment, { foreignKey: 'businessId', as: 'appointments' });
Appointment.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

Appointment.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
User.hasMany(Appointment, { foreignKey: 'agentId', as: 'appointments' });

module.exports = {
  Business,
  User,
  Lead,
  Conversation,
  Appointment
};
