const aiService = require('../services/ai.service');
const { Lead } = require('../models');

const respondToMessage = async (req, res) => {
  try {
    const { leadId, message, channel } = req.body;

    if (!leadId || !message || !channel) {
      return res.status(400).json({
        success: false,
        error: { message: 'leadId, message, and channel are required' }
      });
    }

    const result = await aiService.processMessage(
      leadId,
      message,
      channel,
      req.businessId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI respond error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to process message' }
    });
  }
};

const testAI = async (req, res) => {
  try {
    const { message } = req.body;

    // Create a temporary test lead
    const testLead = await Lead.create({
      businessId: req.businessId,
      phone: '+910000000000',
      source: 'test',
      status: 'new'
    });

    const result = await aiService.processMessage(
      testLead.id,
      message,
      'test',
      req.businessId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'AI test failed' }
    });
  }
};

module.exports = {
  respondToMessage,
  testAI
};
