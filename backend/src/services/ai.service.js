const OpenAI = require('openai');
const { Lead, Conversation } = require('../models');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async processMessage(leadId, message, channel, businessId) {
    try {
      // Fetch lead with conversation history
      const lead = await Lead.findByPk(leadId, {
        include: [{
          model: Conversation,
          as: 'conversations',
          limit: 10,
          order: [['timestamp', 'DESC']]
        }]
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Build conversation history
      const conversationHistory = this.buildConversationHistory(lead.conversations);

      // Generate system prompt based on lead data
      const systemPrompt = this.buildSystemPrompt(lead);

      // Get AI response
      const aiResponse = await this.generateResponse(systemPrompt, conversationHistory, message);

      // Extract intent and entities
      const intent = this.detectIntent(message);
      const entities = this.extractEntities(message);

      // Update lead with extracted information
      await this.updateLeadFromEntities(leadId, entities);

      // Save conversations
      await Conversation.create({
        leadId,
        businessId,
        channel,
        sender: 'lead',
        message,
        aiMetadata: { intent, entities },
        direction: 'inbound',
        timestamp: new Date()
      });

      await Conversation.create({
        leadId,
        businessId,
        channel,
        sender: 'ai',
        message: aiResponse,
        direction: 'outbound',
        timestamp: new Date()
      });

      // Update lead score
      const leadScore = await this.calculateLeadScore(leadId);

      // Determine next action
      const nextAction = this.determineNextAction(lead, intent, entities);

      return {
        response: aiResponse,
        intent,
        entities,
        nextAction,
        leadScore
      };
    } catch (error) {
      logger.error('AI Service processMessage error:', error);
      throw error;
    }
  }

  buildSystemPrompt(lead) {
    return `You are PropBot AI, a friendly and professional real estate assistant for a real estate agency.

Your Role:
- Help qualify real estate leads
- Collect important information
- Schedule property viewings
- Maintain a warm, helpful, and professional tone

Current Lead Information:
- Name: ${lead.name || 'Unknown (ask for it)'}
- Phone: ${lead.phone}
- Email: ${lead.email || 'Not provided (ask for it)'}
- Interest Type: ${lead.inquiryType || 'Not specified (ask buy/rent/sell)'}
- Budget: ${lead.budgetMin && lead.budgetMax ? `₹${lead.budgetMin} - ₹${lead.budgetMax}` : 'Not specified (ask for budget)'}
- Location: ${lead.locationPreference || 'Not specified (ask for preferred location)'}
- Property Type: ${lead.propertyInterest || 'Not specified (ask what type of property)'}
- Timeline: ${lead.timeline || 'Not specified (ask when they want to move)'}

Guidelines:
1. Be warm, friendly, and professional
2. Ask ONE clear question at a time
3. Keep responses concise (under 100 words)
4. If information is missing, politely ask for it
5. Use simple language, avoid jargon
6. Use emojis sparingly (🏡 for properties, 📅 for appointments)
7. Once you have all key info (budget, location, timeline, property type), offer to schedule a viewing
8. If the lead is ready and qualified, suggest scheduling an appointment

Missing Information Priority:
1. Name (if not known)
2. Inquiry type (buy/rent/sell)
3. Budget range
4. Location preference
5. Property type
6. Timeline

Never:
- Don't ask multiple questions in one message
- Don't overwhelm with too much information
- Don't make promises about specific properties without verification
- Don't share personal opinions about areas or pricing`;
  }

  async generateResponse(systemPrompt, history, userMessage) {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage }
    ];

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 200
    });

    return completion.choices[0].message.content;
  }

  buildConversationHistory(conversations) {
    return conversations
      .reverse()
      .slice(-10) // Last 10 messages
      .map(conv => ({
        role: conv.sender === 'lead' ? 'user' : 'assistant',
        content: conv.message || conv.voiceTranscript || ''
      }));
  }

  detectIntent(message) {
    const lowerMessage = message.toLowerCase();

    const intents = {
      greeting: /^(hi|hello|hey|good morning|good afternoon|good evening|namaste)/i,
      inquiry: /(interested|looking for|want to buy|want to rent|need|searching)/i,
      budget: /(budget|afford|price|cost|₹|rs|lakh|crore|spend)/i,
      location: /(location|area|locality|near|bhk|apartment|villa|plot|where)/i,
      appointment: /(visit|see|schedule|meeting|appointment|viewing|show|when can)/i,
      urgency: /(urgent|immediate|asap|soon|today|tomorrow|this week)/i,
      confirmation: /(yes|yeah|sure|okay|ok|confirm|book|sounds good)/i,
      rejection: /(no|not interested|maybe later|too expensive|not now)/i,
      question: /(what|when|where|how|why|which)/i
    };

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(lowerMessage)) {
        return intent;
      }
    }

    return 'general';
  }

  extractEntities(message) {
    const entities = {};

    // Extract budget (handles formats like "50 lakh", "1.5 crore", "Rs 75L")
    const budgetPatterns = [
      /(\d+(?:\.\d+)?)\s*(lakh|lakhs|l)/i,
      /(\d+(?:\.\d+)?)\s*(crore|crores|cr)/i,
      /rs\.?\s*(\d+(?:,\d+)*)/i
    ];

    for (const pattern of budgetPatterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        const unit = match[2]?.toLowerCase();
        
        if (unit?.startsWith('cr')) {
          entities.budget = amount * 10000000;
        } else if (unit?.startsWith('l')) {
          entities.budget = amount * 100000;
        } else {
          entities.budget = amount;
        }
        break;
      }
    }

    // Extract BHK
    const bhkMatch = message.match(/(\d+)\s*bhk/i);
    if (bhkMatch) {
      entities.propertyType = `${bhkMatch[1]} BHK`;
    }

    // Extract property types
    const propertyTypes = ['apartment', 'villa', 'plot', 'house', 'flat', 'studio', 'penthouse', 'duplex'];
    propertyTypes.forEach(type => {
      if (message.toLowerCase().includes(type)) {
        entities.propertyType = entities.propertyType 
          ? `${entities.propertyType} ${type}` 
          : type;
      }
    });

    // Extract timeline keywords
    const timelinePatterns = {
      'immediate': /urgent|immediate|asap|right now|this week/i,
      '1-3months': /within.*month|next.*month|1-3 months|few weeks/i,
      '3-6months': /3-6 months|quarter|few months|3 to 6/i,
      '6months+': /6 months|next year|long term|eventually/i
    };

    for (const [timeline, pattern] of Object.entries(timelinePatterns)) {
      if (pattern.test(message)) {
        entities.timeline = timeline;
        break;
      }
    }

    // Extract inquiry type
    if (/\b(buy|purchase|buying)\b/i.test(message)) {
      entities.inquiryType = 'buy';
    } else if (/\b(rent|rental|renting|lease)\b/i.test(message)) {
      entities.inquiryType = 'rent';
    } else if (/\b(sell|selling)\b/i.test(message)) {
      entities.inquiryType = 'sell';
    }

    return entities;
  }

  async updateLeadFromEntities(leadId, entities) {
    const updateData = {};

    if (entities.budget) {
      updateData.budgetMin = entities.budget * 0.8;
      updateData.budgetMax = entities.budget * 1.2;
    }

    if (entities.propertyType) {
      updateData.propertyInterest = entities.propertyType;
    }

    if (entities.timeline) {
      updateData.timeline = entities.timeline;
    }

    if (entities.inquiryType) {
      updateData.inquiryType = entities.inquiryType;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.lastContactAt = new Date();
      await Lead.update(updateData, { where: { id: leadId } });
    }
  }

  async calculateLeadScore(leadId) {
    const lead = await Lead.findByPk(leadId, {
      include: [{ model: Conversation, as: 'conversations' }]
    });

    let score = 0;

    // Contact info (30 points max)
    if (lead.name) score += 10;
    if (lead.email) score += 10;
    if (lead.phone) score += 10;

    // Property info (40 points max)
    if (lead.budgetMin && lead.budgetMax) score += 20;
    if (lead.locationPreference) score += 10;
    if (lead.propertyInterest) score += 10;

    // Timeline (20 points max)
    const timelineScores = {
      'immediate': 20,
      '1-3months': 15,
      '3-6months': 10,
      '6months+': 5
    };
    if (lead.timeline) {
      score += timelineScores[lead.timeline] || 0;
    }

    // Engagement (10 points max)
    const messageCount = lead.conversations?.length || 0;
    if (messageCount >= 5) score += 10;
    else if (messageCount >= 3) score += 5;

    // Cap at 100
    score = Math.min(score, 100);

    // Determine temperature
    let temperature;
    if (score >= 70) temperature = 'hot';
    else if (score >= 40) temperature = 'warm';
    else temperature = 'cold';

    await Lead.update(
      { score, temperature },
      { where: { id: leadId } }
    );

    return { score, temperature };
  }

  determineNextAction(lead, intent, entities) {
    // If high score and appointment intent
    if (lead.score >= 70 && intent === 'appointment') {
      return 'schedule_appointment';
    }

    // If urgent timeline
    if (entities.timeline === 'immediate' || intent === 'urgency') {
      return 'escalate_to_agent';
    }

    // If all key info collected
    const hasAllInfo = lead.budgetMin && lead.locationPreference && lead.propertyInterest;
    if (hasAllInfo) {
      return 'offer_appointment';
    }

    // Continue collecting info
    return 'collect_info';
  }
}

module.exports = new AIService();
