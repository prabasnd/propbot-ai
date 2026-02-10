# 🚀 Quick Deployment Guide - PropBot AI

## Step-by-Step: Go Live in 15 Minutes

### ✅ Prerequisites Checklist
- [ ] GitHub account
- [ ] Render account (free): https://render.com
- [ ] Vercel account (free): https://vercel.com
- [ ] OpenAI API key: https://platform.openai.com/api-keys
- [ ] Credit card (for OpenAI - they offer free credits)

---

## 📦 Part 1: Deploy Backend to Render (5 minutes)

### 1. Push to GitHub
```bash
cd propbot-ai
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/propbot-ai.git
git push -u origin main
```

### 2. Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - **Name**: `propbot-db`
   - **Database**: `propbot`
   - **User**: `propbot_user`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **"Create Database"**
5. **Copy the "Internal Database URL"** - you'll need this!

### 3. Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Fill in:
   - **Name**: `propbot-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables** (click "Add Environment Variable"):

```
NODE_ENV = production
PORT = 5000
DATABASE_URL = [Paste Internal Database URL from step 2]
JWT_SECRET = [Generate random 32+ character string]
FRONTEND_URL = https://propbot-ai.vercel.app
OPENAI_API_KEY = sk-proj-your-openai-key-here

# Optional (can add later):
TWILIO_ACCOUNT_SID = (leave blank for now)
TWILIO_AUTH_TOKEN = (leave blank for now)
RAZORPAY_KEY_ID = (leave blank for now)
RAZORPAY_KEY_SECRET = (leave blank for now)
```

5. Click **"Create Web Service"**

6. Wait for deployment (2-3 minutes)

7. **Run Database Migration**:
   - Once deployed, click **"Shell"** tab
   - Run: `node src/scripts/migrate.js`
   - You should see "Migration completed successfully!"

8. **Copy your backend URL**: e.g., `https://propbot-backend.onrender.com`

---

## 🎨 Part 2: Deploy Frontend to Vercel (5 minutes)

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Navigate to frontend**:
```bash
cd frontend
```

3. **Login to Vercel**:
```bash
vercel login
```

4. **Deploy**:
```bash
vercel --prod
```

5. **Follow prompts**:
   - Set up and deploy: **Y**
   - Which scope: **Your account**
   - Link to existing project: **N**
   - Project name: **propbot-ai**
   - Directory: **./  (press Enter)**
   - Override settings: **N**

6. **Add Environment Variable in Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add: 
     - Key: `VITE_API_URL`
     - Value: `https://propbot-backend.onrender.com` (your Render URL)
   - Click **"Save"**
   - **Redeploy** (go to Deployments → click on latest → click "Redeploy")

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. **Import Git Repository**
3. Select your GitHub repository
4. **Configure**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Add Environment Variable**:
   - `VITE_API_URL` = `https://propbot-backend.onrender.com`
6. Click **"Deploy"**

7. **Copy your frontend URL**: e.g., `https://propbot-ai.vercel.app`

---

## 🔗 Part 3: Connect Frontend & Backend (2 minutes)

### Update Backend CORS

1. Go to Render dashboard → Your backend service
2. Go to **Environment**
3. Edit `FRONTEND_URL` variable
4. Change to your actual Vercel URL: `https://propbot-ai.vercel.app`
5. Save (this will trigger a redeploy)

---

## ✅ Part 4: Test Your Application (3 minutes)

1. **Open your Vercel URL** in browser

2. **Register a new account**:
   - Business Name: "Test Real Estate"
   - Email: your-email@example.com
   - Password: testpassword123

3. **You should see**:
   - Login successful
   - Dashboard with stats
   - Sidebar navigation

4. **Test creating a lead**:
   - Go to Leads page
   - Click "Create Lead" (if you add this button)
   - Or use API directly

5. **Test AI Response** (using browser console or Postman):
```javascript
// In browser console on your Vercel site:
const token = localStorage.getItem('token');

fetch('https://propbot-backend.onrender.com/api/ai/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: "Hi, I'm looking for a 3 BHK apartment in Mumbai with a budget of 1 crore"
  })
})
.then(r => r.json())
.then(console.log);
```

---

## 🎉 Success! Your App is Live!

**Frontend**: https://your-app.vercel.app  
**Backend**: https://your-backend.onrender.com  
**Database**: PostgreSQL on Render

---

## 🔧 Common Issues & Fixes

### Issue 1: "Network Error" or CORS error
**Fix**: Make sure `FRONTEND_URL` in Render exactly matches your Vercel URL (no trailing slash)

### Issue 2: "Invalid authentication token"
**Fix**: 
- Check JWT_SECRET is set in Render
- Try logging out and logging in again

### Issue 3: Database connection failed
**Fix**: 
- Verify DATABASE_URL is correct in Render
- Make sure you ran the migration script

### Issue 4: AI not responding
**Fix**:
- Verify OPENAI_API_KEY is valid
- Check you have OpenAI credits
- View Render logs for detailed error

### Issue 5: Free Render service "spins down"
**Fix**: Free services sleep after 15 minutes of inactivity. First request after sleep takes 30-60 seconds. Upgrade to paid ($7/mo) for always-on.

---

## 📊 View Logs

### Backend Logs (Render):
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab

### Frontend Logs (Vercel):
1. Go to Vercel dashboard
2. Click your project
3. Click "Deployments" → Latest deployment → "Functions" or "Runtime Logs"

---

## 💡 Next Steps

1. **Add Twilio** for WhatsApp messaging:
   - Get Twilio account
   - Add credentials to Render
   - Configure webhook

2. **Add Razorpay** for payments:
   - Get Razorpay account
   - Add credentials to Render
   - Test subscription flow

3. **Custom Domain**:
   - Vercel: Add your domain in Project Settings
   - Render: Add custom domain in service settings

4. **Monitoring**:
   - Set up Render health check alerts
   - Monitor OpenAI API usage
   - Track database size

---

## 💰 Cost Breakdown

**First Month**: $0 (all free tiers)  
**After Free Credits**:
- OpenAI API: ~$20-50/month (usage-based)
- Render Free Tier: $0 (with limitations)
- Vercel Free Tier: $0

**Recommended Production**:
- Render Web + DB: $14/month
- Vercel Pro: $20/month
- OpenAI: ~$30-100/month
- Total: ~$64-134/month

---

## 🆘 Need Help?

1. Check the main README.md
2. Review Render logs
3. Check browser console
4. Verify all environment variables are set correctly

---

**Congratulations! 🎉 You've successfully deployed PropBot AI!**
