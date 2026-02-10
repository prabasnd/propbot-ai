const { Conversation, Lead } = require('../models');

const getConversations = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { channel = 'all', page = 1, limit = 50 } = req.query;

    const where = { leadId, businessId: req.businessId };

    if (channel !== 'all') {
      where.channel = channel;
    }

    const offset = (page - 1) * limit;

    const { count, rows: conversations } = await Conversation.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['timestamp', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch conversations' }
    });
  }
};

const createConversation = async (req, res) => {
  try {
    const { leadId, channel, message, sender } = req.body;

    const conversation = await Conversation.create({
      leadId,
      businessId: req.businessId,
      channel,
      message,
      sender: sender || 'agent',
      direction: sender === 'lead' ? 'inbound' : 'outbound',
      timestamp: new Date()
    });

    // Update last contact
    await Lead.update(
      { lastContactAt: new Date() },
      { where: { id: leadId } }
    );

    res.status(201).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create conversation' }
    });
  }
};

module.exports = {
  getConversations,
  createConversation
};
