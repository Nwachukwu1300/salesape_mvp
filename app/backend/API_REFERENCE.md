# Complete API Reference - SalesApe MVP

## Base URL
```
http://localhost:3001
```

## Authentication
All endpoints (except public audit) require Bearer token in header:
```
Authorization: Bearer {supabase_auth_token}
```

---

## Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Businesses](#business-endpoints)
3. [Leads](#lead-endpoints)
4. [SEO Audit](#seo-audit)
5. [Content Studio](#content-studio)
6. [Social Media](#social-media)
7. [Dashboard](#dashboard-endpoints)
8. [Templates](#template-endpoints)

---

## Authentication Endpoints

### POST /register
**Purpose:** Register new user account

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "businessName": "My Business"
}
```

**Response:** 
```json
{
  "user": { "id": "user_123", "email": "user@example.com" },
  "token": "eyJhbGciOiJIUzI1..."
}
```

---

### POST /login
**Purpose:** Login user

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": { "id": "user_123" },
  "token": "eyJhbGciOiJIUzI1..."
}
```

---

## Business Endpoints

### GET /businesses
**Purpose:** List all businesses for authenticated user

**Response:**
```json
{
  "businesses": [
    {
      "id": "biz_001",
      "name": "Web Design Studio",
      "industry": "design",
      "website": "https://example.com",
      "status": "active",
      "leads": 12,
      "bookings": 3,
      "lastUpdated": "2026-02-15T10:30:00Z"
    }
  ]
}
```

---

### POST /businesses
**Purpose:** Create new business

**Body:**
```json
{
  "name": "Web Design Studio",
  "industry": "design",
  "description": "Professional web design services",
  "website": "https://example.com",
  "email": "contact@example.com",
  "phone": "+1-555-0100"
}
```

**Response:** `201 Created`
```json
{
  "business": {
    "id": "biz_001",
    "name": "Web Design Studio",
    "status": "pending_setup"
  }
}
```

---

### GET /businesses/:businessId
**Purpose:** Get business details

**Response:**
```json
{
  "business": {
    "id": "biz_001",
    "name": "Web Design Studio",
    "industry": "design",
    "website": "https://example.com",
    "config": {
      "title": "Professional Web Design",
      "description": "Custom websites for businesses",
      "heroImage": "https://...",
      "ctaText": "Get Your Free Audit"
    },
    "createdAt": "2026-01-15T08:00:00Z"
  }
}
```

---

### PUT /businesses/:businessId
**Purpose:** Update business details

**Body:**
```json
{
  "name": "Updated Name",
  "website": "https://newsite.com",
  "config": {
    "title": "New Title",
    "description": "Updated description"
  }
}
```

---

## Lead Endpoints

### POST /businesses/:businessId/leads
**Purpose:** Create new lead (from conversation flow)

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0101",
  "message": "Interested in web design services",
  "budget": "5000",
  "timeline": "ASAP",
  "source": "website_chat",
  "intentionality": "high"
}
```

**Response:** `201 Created`
```json
{
  "lead": {
    "id": "lead_001",
    "name": "John Doe",
    "priorityScore": 78,
    "intentCategory": "high",
    "status": "new"
  }
}
```

---

### GET /businesses/:businessId/leads
**Purpose:** List all leads

**Query Parameters:**
- `status` (optional): "new", "contacted", "converted", "lost"
- `priority` (optional): "high", "medium", "low"
- `limit` (optional): number (default: 50)
- `offset` (optional): number (default: 0)

**Response:**
```json
{
  "leads": [
    {
      "id": "lead_001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0101",
      "priorityScore": 78,
      "intentCategory": "high",
      "status": "contacted",
      "createdAt": "2026-02-14T14:30:00Z"
    }
  ],
  "total": 145,
  "hasMore": true
}
```

---

### GET /businesses/:businessId/leads/:leadId
**Purpose:** Get lead details

**Response:**
```json
{
  "lead": {
    "id": "lead_001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0101",
    "message": "Interested in web design services",
    "priorityScore": 78,
    "intentCategory": "high",
    "status": "contacted",
    "conversionTimeline": "30 days",
    "nextFollowUp": "2026-02-17T10:00:00Z",
    "activities": [
      {
        "type": "email_sent",
        "subject": "Welcome to Our Services",
        "timestamp": "2026-02-14T14:35:00Z"
      }
    ]
  }
}
```

---

### PUT /businesses/:businessId/leads/:leadId
**Purpose:** Update lead status or details

**Body:**
```json
{
  "status": "converted",
  "notes": "Booked consultation for Feb 20",
  "conversionValue": 2500
}
```

---

### POST /businesses/:businessId/leads/:leadId/send-email
**Purpose:** Send email to lead

**Body:**
```json
{
  "templateId": "welcome_email",
  "subject": "Welcome!",
  "message": "Custom message",
  "variables": {
    "firstName": "John"
  }
}
```

---

## SEO Audit

### POST /seo-audit
**Purpose:** Run SEO audit for authenticated user (2/month limit)

**Authentication:** Required

**Body:**
```json
{
  "url": "https://example.com",
  "email": "user@example.com"
}
```

**Response:** `201 Created`
```json
{
  "audit": {
    "id": "audit_001",
    "url": "https://example.com",
    "performanceScore": 82,
    "seoScore": 91,
    "accessibilityScore": 78,
    "bestPracticesScore": 88,
    "issues": [
      {
        "severity": "warning",
        "title": "Image elements do not have explicit width and height",
        "description": "Set an explicit width and height on image elements...",
        "impact": 5
      }
    ],
    "recommendations": [
      {
        "title": "Add structured data markup",
        "description": "Implement JSON-LD schema for LocalBusiness...",
        "priority": "high"
      }
    ],
    "createdAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### POST /seo-audit-public
**Purpose:** Run public SEO audit (1/week per IP, no auth)

**Authentication:** Not required

**Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:** `201 Created`
```json
{
  "audit": {
    "overallScore": 85,
    "performanceScore": 82,
    "seoScore": 91,
    "accessibilityScore": 78,
    "mobileScore": 84,
    "recommendations": [...]
  }
}
```

---

## Content Studio

### POST /businesses/:businessId/content-projects
**Purpose:** Create content generation project

**Body:**
```json
{
  "inputType": "url",
  "inputUrl": "https://example.com/blog-post",
  "reelsRequested": 3,
  "style": "educational",
  "autoPublish": false
}
```

**Response:** `201 Created`
```json
{
  "project": {
    "id": "proj_001",
    "status": "processing",
    "reelsRequested": 3,
    "createdAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### GET /businesses/:businessId/content-projects
**Purpose:** List content projects

**Response:**
```json
{
  "projects": [
    {
      "id": "proj_001",
      "inputType": "url",
      "status": "completed",
      "reelsGenerated": 3,
      "createdAt": "2026-02-15T10:30:00Z"
    }
  ]
}
```

---

### GET /businesses/:businessId/content-projects/:projectId
**Purpose:** Get project details with generated reels

**Response:**
```json
{
  "project": {
    "id": "proj_001",
    "status": "completed",
    "reelsRequested": 3,
    "reels": [
      {
        "id": "reel_001",
        "title": "5 SEO Tips",
        "hook": "Your website could be...",
        "platform": "instagram",
        "status": "published",
        "prePublishScore": 87,
        "engagement": 12.3
      }
    ]
  }
}
```

---

### POST /reel/:reelId/publish
**Purpose:** Publish reel to social platforms

**Body:**
```json
{
  "platforms": ["instagram", "tiktok"],
  "scheduleTime": "2026-02-16T14:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reel queued for publishing to instagram, tiktok",
  "reelId": "reel_001"
}
```

---

### GET /reel/:reelId/analytics
**Purpose:** Get reel engagement metrics

**Response:**
```json
{
  "reel": {
    "id": "reel_001",
    "title": "5 SEO Tips",
    "platform": "instagram",
    "status": "published",
    "analytics": {
      "views": 4532,
      "likes": 342,
      "comments": 87,
      "shares": 23,
      "engagementRate": 9.87
    }
  }
}
```

---

## Social Media

### GET /social-accounts
**Purpose:** List user's connected social accounts

**Response:**
```json
{
  "accounts": [
    {
      "id": "sa_001",
      "platform": "instagram",
      "username": "@mybusiness",
      "connected": true,
      "connectedAt": "2026-01-15T08:00:00Z"
    },
    {
      "id": "sa_002",
      "platform": "tiktok",
      "username": "mybusiness",
      "connected": false
    }
  ]
}
```

---

### POST /social-accounts/:platform/connect
**Purpose:** Connect social media account

**Body:**
```json
{
  "accessToken": "..."
}
```

---

### POST /social-accounts/:accountId/disconnect
**Purpose:** Disconnect social account

---

## Dashboard Endpoints

### GET /dashboard/stats
**Purpose:** Get aggregated KPI metrics

**Response:**
```json
{
  "summary": {
    "totalWebsites": 5,
    "liveWebsites": 3,
    "totalLeads": 127,
    "totalBookings": 18,
    "thisMonthLeads": 32,
    "thisMonthBookings": 5,
    "conversionRate": 14.17,
    "avgSeoScore": 78.5,
    "avgWebsiteViews": 2341
  },
  "breakdown": {
    "byStatus": {
      "live": 3,
      "draft": 2
    },
    "leads": {
      "total": 127,
      "converted": 18,
      "pending": 109
    }
  },
  "recentStats": {
    "thisMonth": {
      "leads": 32,
      "bookings": 5
    }
  }
}
```

---

### GET /businesses/:businessId/analytics
**Purpose:** Get analytics for specific business

**Query Parameters:**
- `period` (optional): "week", "month", "quarter", "year"
- `metric` (optional): "leads", "bookings", "views", "seo"

**Response:**
```json
{
  "analytics": {
    "period": "month",
    "leads": {
      "total": 32,
      "trend": "+15% from last month",
      "bySource": {
        "website_chat": 12,
        "email": 8,
        "phone": 7,
        "referral": 5
      }
    },
    "bookings": {
      "total": 5,
      "avgValue": 1500,
      "conversionRate": 15.6
    },
    "website": {
      "views": 2341,
      "uniqueVisitors": 1847,
      "bounceRate": 42.3,
      "avgSessionDuration": 145
    },
    "seo": {
      "avgScore": 78.5,
      "keyword1": "web design",
      "keyword1Rank": 5,
      "keyword2": "professional designer",
      "keyword2Rank": 12
    }
  }
}
```

---

### POST /businesses/:businessId/analytics/track
**Purpose:** Track custom event

**Body:**
```json
{
  "eventType": "website_viewed",
  "metadata": {
    "referrer": "google",
    "duration": 145
  }
}
```

---

## Template Endpoints

### GET /templates
**Purpose:** List available website templates

**Response:**
```json
{
  "templates": [
    {
      "id": "template_agency",
      "name": "Agency",
      "industry": ["marketing", "design", "consulting"],
      "description": "Professional agency portfolio template",
      "preview": "https://...",
      "sections": ["hero", "services", "portfolio", "team", "testimonials"]
    },
    {
      "id": "template_saas",
      "name": "SaaS",
      "industry": ["technology", "software"],
      "description": "Modern SaaS product landing page",
      "preview": "https://...",
      "sections": ["hero", "features", "pricing", "faq", "cta"]
    }
  ]
}
```

---

### POST /businesses/:businessId/apply-template
**Purpose:** Apply template to business website

**Body:**
```json
{
  "templateId": "template_agency",
  "overrides": {
    "title": "My Agency",
    "description": "We build amazing websites"
  }
}
```

**Response:**
```json
{
  "success": true,
  "business": {
    "id": "biz_001",
    "template": "template_agency",
    "status": "active"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

### Example Error Response

```json
{
  "error": "Business not found",
  "code": "BUSINESS_NOT_FOUND",
  "details": {
    "businessId": "invalid_id"
  }
}
```

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| SEO Audit | 2 | month |
| SEO Audit Public | 1 | week (per IP) |
| Create Lead | 100 | hour |
| Create Project | 20 | hour |
| Publish Reel | 50 | hour |
| General API | 1000 | hour |

Rate limit info in response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1613441234
```

---

## Webhook Events

Subscribe to events via dashboard:

### lead.created
```json
{
  "event": "lead.created",
  "data": {
    "leadId": "lead_001",
    "businessId": "biz_001",
    "name": "John Doe",
    "priority": "high"
  }
}
```

### booking.completed
```json
{
  "event": "booking.completed",
  "data": {
    "bookingId": "book_001",
    "leadId": "lead_001",
    "amount": 2500
  }
}
```

### reel.published
```json
{
  "event": "reel.published",
  "data": {
    "reelId": "reel_001",
    "platforms": ["instagram", "tiktok"],
    "timestamp": "2026-02-15T14:30:00Z"
  }
}
```

---

## SDK/Client Libraries

### JavaScript/TypeScript
```typescript
import { SalesApeClient } from '@salesape/js-sdk';

const client = new SalesApeClient({
  token: 'YOUR_TOKEN',
  baseUrl: 'http://localhost:3001'
});

// Create lead
const lead = await client.leads.create(businessId, {
  name: 'John Doe',
  email: 'john@example.com'
});

// Get dashboard stats
const stats = await client.dashboard.getStats();
```

---

## Testing Tools

### cURL Examples

**Create Lead:**
```bash
curl -X POST http://localhost:3001/businesses/biz_001/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Interested in services"
  }'
```

**Get Dashboard Stats:**
```bash
curl http://localhost:3001/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Publish Reel:**
```bash
curl -X POST http://localhost:3001/reel/reel_001/publish \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"platforms": ["instagram", "tiktok"]}'
```

---

## Changelog

### v1.0.0 (Current)
- ✅ All core endpoints implemented
- ✅ Content Studio with multi-platform publishing
- ✅ Real SEO audit with Lighthouse API
- ✅ Lead automation and scoring
- ✅ Dashboard KPI aggregation
- ✅ Background job processing (BullMQ)
- ✅ Social media analytics tracking

---

## Support & Documentation

- **Full API Docs:** [CONTENT_STUDIO_API.md](./CONTENT_STUDIO_API.md)
- **Security Hardening:** [SECURITY_HARDENING.md](./SECURITY_HARDENING.md)
- **Integration Guide:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Build Summary:** [BUILD_SUMMARY.md](./BUILD_SUMMARY.md)
