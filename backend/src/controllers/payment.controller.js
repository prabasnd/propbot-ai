const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Business } = require('../models');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

const createSubscription = async (req, res) => {
  try {
    const { planId, billingCycle = 'monthly' } = req.body;

    // In a real app, fetch plan details from database
    const planPrices = {
      starter: { monthly: 99900, yearly: 999900 }, // in paise
      pro: { monthly: 299900, yearly: 2999900 },
      enterprise: { monthly: 599900, yearly: 5999900 }
    };

    const amount = planPrices[planId]?.[billingCycle] || 99900;

    // For development, return mock data
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'dummy_key') {
      return res.json({
        success: true,
        data: {
          subscriptionId: 'sub_mock_' + Date.now(),
          shortUrl: 'https://rzp.io/l/mock_payment',
          status: 'created',
          message: 'Mock payment created (RAZORPAY_KEY_ID not configured)'
        }
      });
    }

    // Create Razorpay subscription (real implementation)
    const subscription = await razorpay.subscriptions.create({
      plan_id: `plan_${planId}_${billingCycle}`,
      customer_notify: 1,
      quantity: 1,
      total_count: billingCycle === 'yearly' ? 1 : 12,
      notes: {
        business_id: req.businessId,
        billing_cycle: billingCycle
      }
    });

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        shortUrl: subscription.short_url,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create subscription' }
    });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_secret')
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid webhook signature' }
      });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload.subscription.entity);
        break;
      
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.payment.entity);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
    }

    res.json({ success: true, status: 'processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Webhook processing failed' }
    });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const business = await Business.findByPk(req.businessId);

    res.json({
      success: true,
      data: {
        status: business.subscriptionStatus,
        trialEndsAt: business.trialEndsAt,
        subscriptionEndsAt: business.subscriptionEndsAt,
        planId: business.planId
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch subscription status' }
    });
  }
};

// Helper functions
async function handleSubscriptionActivated(subscription) {
  const businessId = subscription.notes?.business_id;
  if (businessId) {
    await Business.update({
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date(subscription.current_end * 1000)
    }, {
      where: { id: businessId }
    });
  }
}

async function handleSubscriptionCharged(payment) {
  // Log payment transaction
  console.log('Payment charged:', payment);
}

async function handleSubscriptionCancelled(subscription) {
  const businessId = subscription.notes?.business_id;
  if (businessId) {
    await Business.update({
      subscriptionStatus: 'cancelled'
    }, {
      where: { id: businessId }
    });
  }
}

async function handlePaymentFailed(payment) {
  console.error('Payment failed:', payment);
}

module.exports = {
  createSubscription,
  handleWebhook,
  getSubscriptionStatus
};
