const { Lead, Conversation, Appointment, User } = require('../models');
const { Op } = require('sequelize');

const createLead = async (req, res) => {
  try {
    const { name, phone, email, source, inquiryType, propertyInterest } = req.body;

    // Check if lead exists
    const existingLead = await Lead.findOne({
      where: { phone, businessId: req.businessId }
    });

    if (existingLead) {
      return res.status(400).json({
        success: false,
        error: { message: 'Lead with this phone number already exists' }
      });
    }

    const lead = await Lead.create({
      businessId: req.businessId,
      name,
      phone,
      email,
      source: source || 'manual',
      inquiryType,
      propertyInterest,
      lastContactAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create lead' }
    });
  }
};

const getLeads = async (req, res) => {
  try {
    const {
      status,
      temperature,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const where = { businessId: req.businessId };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (temperature && temperature !== 'all') {
      where.temperature = temperature;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: leads } = await Lead.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch leads' }
    });
  }
};

const getLeadById = async (req, res) => {
  try {
    const { leadId } = req.params;

    const lead = await Lead.findOne({
      where: { id: leadId, businessId: req.businessId },
      include: [
        { model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] },
        {
          model: Conversation,
          as: 'conversations',
          limit: 50,
          order: [['timestamp', 'DESC']]
        },
        {
          model: Appointment,
          as: 'appointments',
          order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
        }
      ]
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lead not found' }
      });
    }

    res.json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch lead' }
    });
  }
};

const updateLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const updates = req.body;

    const lead = await Lead.findOne({
      where: { id: leadId, businessId: req.businessId }
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lead not found' }
      });
    }

    await lead.update(updates);

    res.json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update lead' }
    });
  }
};

const updateLeadScore = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { score, temperature } = req.body;

    const lead = await Lead.findOne({
      where: { id: leadId, businessId: req.businessId }
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lead not found' }
      });
    }

    await lead.update({ score, temperature });

    res.json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    console.error('Update lead score error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update lead score' }
    });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadScore
};
