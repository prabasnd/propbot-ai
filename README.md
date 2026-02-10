# PropBot AI - Real Estate AI Customer Support

A complete SaaS application for AI-powered customer support in real estate, featuring chat and voice AI capabilities, lead management, and appointment scheduling.

## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS (Deploy to Vercel)
- **Backend**: Node.js + Express + PostgreSQL (Deploy to Render)
- **AI**: OpenAI GPT-4 for conversations
- **Messaging**: Twilio for WhatsApp/SMS/Voice
- **Payments**: Razorpay for subscriptions

## 📁 Project Structure

```
propbot-ai/
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   └── server.js
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- OpenAI API key
- (Optional) Twilio account for messaging
- (Optional) Razorpay account for payments

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/propbot_db
OPENAI_API_KEY=sk-your-openai-api-key
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update API URL:
```env
VITE_API_URL=http://localhost:5000
```

5. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## 🌐 Production Deployment

### Deploy Backend to Render

1. **Create Render Account**: Sign up at https://render.com

2. **Create PostgreSQL Database**:
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Name: propbot-db
   - Plan: Free (or paid for production)
   - Copy the "Internal Database URL"

3. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name**: propbot-backend
     - **Root Directory**: backend
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (or paid)

4. **Add Environment Variables** in Render:
   ```
   NODE_ENV=production
   DATABASE_URL=[Paste Internal Database URL from step 2]
   JWT_SECRET=[Generate random string]
   FRONTEND_URL=https://your-app.vercel.app
   OPENAI_API_KEY=sk-your-key
   TWILIO_ACCOUNT_SID=your-sid
   TWILIO_AUTH_TOKEN=your-token
   TWILIO_PHONE_NUMBER=+1234567890
   RAZORPAY_KEY_ID=your-key
   RAZORPAY_KEY_SECRET=your-secret
   ```

5. **Deploy**: Click "Create Web Service"

6. **Run Migration**: Once deployed, go to Shell tab and run:
   ```bash
   node src/scripts/migrate.js
   ```

7. **Note your backend URL**: e.g., `https://propbot-backend.onrender.com`

### Deploy Frontend to Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Navigate to frontend directory**:
```bash
cd frontend
```

3. **Update `.env` with production backend URL**:
```env
VITE_API_URL=https://propbot-backend.onrender.com
```

4. **Deploy to Vercel**:
```bash
vercel --prod
```

5. **Follow prompts**:
   - Set up and deploy: Y
   - Which scope: Your account
   - Link to existing project: N
   - Project name: propbot-ai
   - Directory: ./
   - Override build settings: N

6. **Add Environment Variable** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://propbot-backend.onrender.com`
   - Redeploy

7. **Note your frontend URL**: e.g., `https://propbot-ai.vercel.app`

8. **Update Backend CORS**: Update `FRONTEND_URL` in Render environment variables to your Vercel URL

### Alternative: Deploy via GitHub

#### Backend (Render)
1. Push code to GitHub
2. Connect Render to your repository
3. Auto-deploy on push

#### Frontend (Vercel)
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select `frontend` as root directory
4. Add environment variable `VITE_API_URL`
5. Deploy

## 🔧 Configuration

### Twilio Setup (Optional - for WhatsApp/SMS)

1. Sign up at https://twilio.com
2. Get Account SID and Auth Token
3. Buy a phone number with SMS/WhatsApp capabilities
4. Configure webhook URL in Twilio:
   - WhatsApp: `https://your-backend.onrender.com/api/conversations/webhook/twilio`
5. Add credentials to Render environment variables

### Razorpay Setup (Optional - for Payments)

1. Sign up at https://razorpay.com
2. Get API Key ID and Secret from Dashboard
3. Create subscription plans
4. Configure webhook URL: `https://your-backend.onrender.com/api/payment/webhook`
5. Add credentials to Render environment variables

## 📝 API Documentation

### Authentication

**POST /api/auth/register**
```json
{
  "businessName": "Real Estate Co",
  "email": "admin@example.com",
  "password": "securepassword",
  "phone": "+1234567890",
  "name": "John Doe"
}
```

**POST /api/auth/login**
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

### Leads

**GET /api/leads?status=new&temperature=hot**

**POST /api/leads**
```json
{
  "name": "Jane Smith",
  "phone": "+1234567890",
  "email": "jane@example.com",
  "source": "website",
  "inquiryType": "buy"
}
```

### AI Response

**POST /api/ai/respond**
```json
{
  "leadId": "uuid",
  "message": "I'm looking for a 3 BHK apartment",
  "channel": "whatsapp"
}
```

### Appointments

**POST /api/appointments**
```json
{
  "leadId": "uuid",
  "title": "Property Viewing",
  "appointmentDate": "2024-02-15",
  "appointmentTime": "14:00:00",
  "location": "123 Main St",
  "meetingType": "site_visit"
}
```

## 🧪 Testing the Application

### 1. Register a New Account
- Go to your Vercel URL
- Click "Sign up"
- Fill in business details
- You'll get a 14-day trial

### 2. Test AI Chat
- Create a test lead
- Send a message via the AI test endpoint
- Check the response and lead scoring

### 3. Create Appointments
- Navigate to Appointments
- Schedule a new viewing
- Verify it appears in the calendar

## 🔐 Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use strong JWT secrets** (32+ characters)
3. **Enable HTTPS** (Vercel and Render do this by default)
4. **Rotate API keys** regularly
5. **Implement rate limiting** (already configured)
6. **Validate all inputs** (Joi validation included)

## 📊 Monitoring

### Render
- View logs in Render dashboard
- Set up health check: `/health`
- Monitor database performance

### Vercel
- View deployment logs
- Monitor function execution
- Check analytics

## 🐛 Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Verify all environment variables are set
- Check Render logs for errors

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

### Database connection failed
- Check DATABASE_URL format
- Verify PostgreSQL instance is running
- Check SSL settings for production

### AI not responding
- Verify OPENAI_API_KEY is valid
- Check API quota and billing
- Review backend logs for errors

## 💰 Cost Estimates (Monthly)

**Free Tier:**
- Render (Backend): Free (with cold starts)
- Vercel (Frontend): Free (100GB bandwidth)
- PostgreSQL: Free (shared, 1GB storage)
- **Total**: $0/month

**Production Tier:**
- Render Web Service: $7/month
- PostgreSQL: $7/month
- Vercel Pro: $20/month
- OpenAI API: ~$20-50/month (usage-based)
- Twilio: ~$1-20/month (usage-based)
- Razorpay: Free (transaction fees apply)
- **Total**: ~$55-100/month

## 🚀 Next Steps

1. **Add Email Notifications**: Integrate SendGrid or AWS SES
2. **Voice AI**: Implement Twilio Voice + Whisper transcription
3. **Analytics Dashboard**: Add charts with Recharts
4. **Property Listings**: Integrate with real estate APIs
5. **Mobile App**: Build React Native app
6. **Multi-language**: Add i18n support
7. **CRM Integration**: Connect with Salesforce/HubSpot

## 📄 License

MIT License - feel free to use for commercial projects

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review backend logs in Render
3. Check frontend console in browser DevTools
4. Review API documentation above

## 🎉 Success!

Your PropBot AI application is now live! You can:
- ✅ Register new businesses
- ✅ Manage leads with AI scoring
- ✅ Have AI conversations
- ✅ Schedule appointments
- ✅ View analytics dashboard
- ✅ Accept payments (with Razorpay configured)

---

**Built with ❤️ for Real Estate Professionals**
