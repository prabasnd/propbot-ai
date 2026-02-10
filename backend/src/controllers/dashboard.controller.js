const { Lead, Conversation, Appointment } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Total and new leads
    const [totalLeads, newLeads] = await Promise.all([
      Lead.count({ where: { businessId: req.businessId } }),
      Lead.count({
        where: {
          businessId: req.businessId,
          ...dateFilter
        }
      })
    ]);

    // Conversations count
    const conversationsCount = await Conversation.count({
      where: {
        businessId: req.businessId,
        ...(startDate && endDate ? {
          timestamp: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        } : {})
      }
    });

    // Appointments booked
    const appointmentsBooked = await Appointment.count({
      where: {
        businessId: req.businessId,
        ...dateFilter
      }
    });

    // Converted leads
    const convertedLeads = await Lead.count({
      where: {
        businessId: req.businessId,
        status: 'converted',
        ...dateFilter
      }
    });

    // Conversion rate
    const conversionRate = totalLeads > 0 
      ? ((convertedLeads / totalLeads) * 100).toFixed(2)
      : 0;

    // Leads by temperature
    const leadsByTemperature = await Lead.findAll({
      where: { businessId: req.businessId },
      attributes: [
        'temperature',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['temperature'],
      raw: true
    });

    const temperatureMap = leadsByTemperature.reduce((acc, item) => {
      acc[item.temperature] = parseInt(item.count);
      return acc;
    }, { hot: 0, warm: 0, cold: 0 });

    // Leads by source
    const leadsBySource = await Lead.findAll({
      where: { businessId: req.businessId },
      attributes: [
        'source',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['source'],
      raw: true
    });

    const sourceMap = leadsBySource.reduce((acc, item) => {
      acc[item.source] = parseInt(item.count);
      return acc;
    }, {});

    // Leads by status
    const leadsByStatus = await Lead.findAll({
      where: { businessId: req.businessId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const statusMap = leadsByStatus.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        conversationsCount,
        appointmentsBooked,
        convertedLeads,
        conversionRate: parseFloat(conversionRate),
        leadsByTemperature: temperatureMap,
        leadsBySource: sourceMap,
        leadsByStatus: statusMap
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch statistics' }
    });
  }
};

module.exports = {
  getStats
};
