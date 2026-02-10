# 🧪 API Testing Guide - PropBot AI

Complete guide to test all API endpoints using curl, Postman, or browser.

## Base URLs

**Local**: `http://localhost:5000/api`  
**Production**: `https://your-backend.onrender.com/api`

---

## 1. Authentication

### Register New Business

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Premium Realty",
    "email": "admin@premiumrealty.com",
    "password": "securepass123",
    "phone": "+919876543210",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "admin@premiumrealty.com",
      "role": "admin"
    },
    "business": {
      "id": "uuid",
      "name": "Premium Realty",
      "subscriptionStatus": "trial",
      "trialEndsAt": "2024-02-23T..."
    }
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@premiumrealty.com",
    "password": "securepass123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 2. Leads Management

### Create Lead

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "phone": "+919876543210",
    "email": "priya@example.com",
    "source": "website",
    "inquiryType": "buy",
    "propertyInterest": "3 BHK Apartment"
  }'
```

### Get All Leads

```bash
# Get all leads
curl -X GET http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN"

# With filters
curl -X GET "http://localhost:5000/api/leads?status=new&temperature=hot&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search
curl -X GET "http://localhost:5000/api/leads?search=Priya" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Lead

```bash
curl -X GET http://localhost:5000/api/leads/LEAD_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Lead

```bash
curl -X PUT http://localhost:5000/api/leads/LEAD_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "qualified",
    "budgetMin": 8000000,
    "budgetMax": 12000000,
    "locationPreference": "Mumbai, Andheri West"
  }'
```

### Update Lead Score

```bash
curl -X POST http://localhost:5000/api/leads/LEAD_UUID/score \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 85,
    "temperature": "hot"
  }'
```

---

## 3. AI Conversations

### Send Message and Get AI Response

```bash
curl -X POST http://localhost:5000/api/ai/respond \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "LEAD_UUID",
    "message": "Hi, I am looking for a 3 BHK apartment in Mumbai with a budget of 1 crore",
    "channel": "whatsapp"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Hello! I'd be happy to help you find a 3 BHK apartment in Mumbai. That's a great budget range! May I know your preferred area in Mumbai? 🏡",
    "intent": "inquiry",
    "entities": {
      "budget": 10000000,
      "propertyType": "3 BHK",
      "inquiryType": "buy"
    },
    "nextAction": "collect_info",
    "leadScore": {
      "score": 45,
      "temperature": "warm"
    }
  }
}
```

### Test AI (Creates Temporary Lead)

```bash
curl -X POST http://localhost:5000/api/ai/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to buy a villa in Bangalore within 2 crores"
  }'
```

---

## 4. Conversations

### Get Conversations for a Lead

```bash
curl -X GET http://localhost:5000/api/conversations/LEAD_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"

# With filters
curl -X GET "http://localhost:5000/api/conversations/LEAD_UUID?channel=whatsapp&page=1&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Conversation (Manual Message)

```bash
curl -X POST http://localhost:5000/api/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "LEAD_UUID",
    "channel": "webchat",
    "message": "Thank you for your interest. Our agent will contact you soon!",
    "sender": "agent"
  }'
```

---

## 5. Appointments

### Create Appointment

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "LEAD_UUID",
    "title": "Property Viewing - Sky Heights Apartment",
    "description": "Site visit for 3 BHK in Tower A",
    "appointmentDate": "2024-02-20",
    "appointmentTime": "14:30:00",
    "location": "Sky Heights, Andheri West, Mumbai",
    "meetingType": "site_visit",
    "durationMinutes": 60
  }'
```

### Get Appointments

```bash
# All appointments
curl -X GET http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by date
curl -X GET "http://localhost:5000/api/appointments?date=2024-02-20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/appointments?status=scheduled" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Appointment

```bash
curl -X PUT http://localhost:5000/api/appointments/APPOINTMENT_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "notes": "Client confirmed attendance. Will bring ID proof."
  }'
```

---

## 6. Dashboard & Analytics

### Get Dashboard Statistics

```bash
# All time stats
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Date range stats
curl -X GET "http://localhost:5000/api/dashboard/stats?startDate=2024-02-01&endDate=2024-02-28" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLeads": 150,
    "newLeads": 25,
    "conversationsCount": 450,
    "appointmentsBooked": 18,
    "convertedLeads": 8,
    "conversionRate": 5.33,
    "leadsByTemperature": {
      "hot": 12,
      "warm": 45,
      "cold": 93
    },
    "leadsBySource": {
      "whatsapp": 80,
      "website": 45,
      "manual": 25
    },
    "leadsByStatus": {
      "new": 30,
      "contacted": 50,
      "qualified": 40,
      "appointment_set": 18,
      "converted": 8,
      "lost": 4
    }
  }
}
```

---

## 7. Payments (Razorpay)

### Create Subscription

```bash
curl -X POST http://localhost:5000/api/payment/create-subscription \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "starter",
    "billingCycle": "monthly"
  }'
```

### Get Subscription Status

```bash
curl -X GET http://localhost:5000/api/payment/subscription-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Complete Testing Workflow

### 1. Setup
```bash
# Set your base URL
export API_URL="http://localhost:5000/api"

# Or for production
export API_URL="https://your-backend.onrender.com/api"
```

### 2. Register and Login
```bash
# Register
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Realty",
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'

# Save the token from response
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 3. Create a Lead
```bash
LEAD_RESPONSE=$(curl -s -X POST $API_URL/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amit Kumar",
    "phone": "+919876543210",
    "source": "website",
    "inquiryType": "buy"
  }')

# Extract lead ID
LEAD_ID=$(echo $LEAD_RESPONSE | jq -r '.data.lead.id')
echo "Lead ID: $LEAD_ID"
```

### 4. Test AI Conversation
```bash
curl -X POST $API_URL/ai/respond \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"leadId\": \"$LEAD_ID\",
    \"message\": \"I want a 2 BHK in Bangalore for 80 lakhs\",
    \"channel\": \"website\"
  }"
```

### 5. Create Appointment
```bash
curl -X POST $API_URL/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"leadId\": \"$LEAD_ID\",
    \"title\": \"Site Visit\",
    \"appointmentDate\": \"2024-02-20\",
    \"appointmentTime\": \"15:00:00\",
    \"location\": \"Test Location\",
    \"meetingType\": \"site_visit\"
  }"
```

### 6. View Dashboard
```bash
curl -X GET $API_URL/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📱 Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "PropBot AI API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"businessName\": \"Test Realty\",\n  \"email\": \"test@example.com\",\n  \"password\": \"test123\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"test123\"\n}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🔍 Testing Checklist

- [ ] Register new account
- [ ] Login successfully
- [ ] Create a lead
- [ ] Get all leads
- [ ] Filter leads by temperature
- [ ] Send AI message
- [ ] View AI response
- [ ] Check lead score update
- [ ] Create appointment
- [ ] Get appointments
- [ ] View dashboard stats
- [ ] Test subscription creation

---

## 🐛 Common API Errors

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Authentication required"
  }
}
```
**Fix**: Include valid Bearer token in Authorization header

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Email already registered"
  }
}
```
**Fix**: Use different email or check request body

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Lead not found"
  }
}
```
**Fix**: Verify UUID is correct and belongs to your business

### 500 Internal Server Error
**Fix**: Check backend logs for detailed error

---

**Happy Testing! 🧪**
