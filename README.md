# SalesAPE MVP

Turns small businesses into working online businesses automatically. Give us your Instagram or website URL, get a live website with lead capture and booking in minutes.

## Purpose

SalesAPE transforms solo and micro business owners into fully operational online businesses without the need for complex setup. Target users are local service businesses who currently get customers through Instagram or word of mouth but lack proper online infrastructure.

## Core Concept

1. User provides a website URL or Instagram URL
2. Optionally describes their business in natural language
3. System automatically understands the business
4. Generates a live website with branding, lead capture, and booking
5. Business starts receiving and managing leads immediately

## What Gets Generated

- Live website with business name and branding
- Lead capture form
- Booking calendar
- Business email for lead notifications
- Simple dashboard for lead management

## User Flow

```
Landing → Input URL/Instagram → Answer questions → Preview website → Publish → Share link → Receive leads
```

Success signal: Working website + real leads within minutes.

## Long-term Vision

Voice or chat input builds and runs a business end-to-end with full automation.

---

## Tech Stack

**Backend (Both Parties Focus)**
- Node.js with Express 5.2.1
- TypeScript
- tsx for development
- CORS enabled
- In-memory storage (will migrate to database)

**Frontend (Teammate Focus)**
- Next.js 16.1.4 (App Router)
- React 19.2.3
- TypeScript
- Tailwind CSS 4

**Shared**
- TypeScript types between frontend and backend

---

## Project Structure

```
salesape_mvp/
├── app/
│   ├── backend/                    # Backend API (Your work)
│   │   ├── src/
│   │   │   └── index.ts            # Main server with API endpoints
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                   # Frontend app (Teammate work)
│       ├── app/
│       │   ├── components/
│       │   │   └── LeadForm.tsx    # Lead submission form
│       │   ├── page.tsx            # Home/onboarding page
│       │   ├── layout.tsx          # Root layout
│       │   └── globals.css
│       ├── package.json
│       └── tsconfig.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

**Backend setup:**
```bash
cd app/backend
npm install
```

**Frontend setup:**
```bash
cd app/frontend
npm install
```

### Running Locally

**Start backend** (port 3001):
```bash
cd app/backend
npm run dev
```

**Start frontend** (port 3000):
```bash
cd app/frontend
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Backend API Reference

Base URL: `http://localhost:3001`

### Endpoints

#### Health Check
```
GET /health
```
Returns: `{ ok: true }`

#### Create Lead
```
POST /leads
Content-Type: application/json

{
  "name": "string",           // required
  "email": "string",          // required
  "company": "string",        // optional
  "message": "string"         // optional
}
```

Returns (201):
```json
{
  "id": "1737839234567",
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "message": "Interested in your product",
  "createdAt": "2026-01-25T18:27:14.567Z"
}
```

Error (400):
```json
{
  "error": "Name and email are required"
}
```

#### Get All Leads
```
GET /leads
```

Returns (200):
```json
[
  {
    "id": "1737839234567",
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Inc",
    "message": "Interested in your product",
    "createdAt": "2026-01-25T18:27:14.567Z"
  }
]
```

### Testing the API

```bash
# Create a lead
curl -X POST http://localhost:3001/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","message":"Test lead"}'

# Get all leads
curl http://localhost:3001/leads
```

---

## Current Features

**MVP v0.3 (Current - Phase 4 Complete)**
- Complete onboarding flow with URL/Instagram input
- Web scraping of business information from URLs
- AI-powered business analysis
- Multiple website template selection
- Custom branding (colors, fonts, logos)
- Voice and chat input for business description
- User authentication with JWT
- Lead capture form
- Lead storage with Prisma ORM
- Booking calendar backend
- **Team collaboration** (invite members, manage roles)
- **Advanced lead routing** (auto-assign by service/source)
- **Payment integration** (subscription plans: Basic/Pro/Enterprise)
- Health check endpoint
- CORS enabled for local development

**Phase 4 Highlights - Now Complete!**
- 🎤 **Voice Input**: Use Web Speech API to describe your business by voice
- 💬 **Chat Input**: Text-based description with real-time form updates
- 🎨 **Custom Branding**: 
  - Primary and secondary color pickers
  - Font family selector (sans-serif, serif, monospace)
  - Custom logo URL upload
- 📋 **Template Selection**: Choose from multiple pre-built website templates with visual preview
- 👥 **Team Collaboration**: 
  - Invite team members with different roles (admin, manager, member)
  - Track invitation status and team member activity
  - Email invitations for seamless onboarding
- 🔀 **Advanced Lead Routing**: 
  - Automatically assign leads to team members
  - Route by service type or lead source
  - Priority-based rule ordering
  - Enable/disable rules dynamically
- 💳 **Payment Integration**: 
  - Three-tier subscription plans (Basic $29/mo, Pro $99/mo, Enterprise $299/mo)
  - Simulated payment processing (Stripe-ready)
  - Payment history and invoice tracking
  - Automatic plan upgrades

---

## Development Workflow

### Backend Developer Responsibilities

- API endpoint development
- Business logic and data models
- Database integration
- Email/notification services
- Website generation logic
- Instagram/URL parsing
- Authentication and authorization

### Frontend Developer Responsibilities

- Onboarding flow UI
- Website preview component
- Lead dashboard
- Booking calendar UI
- Form components
- Responsive design
- User authentication UI

### Shared Responsibilities

- TypeScript type definitions
- API contract documentation
- Integration testing
- Deployment configuration

---

## Roadmap

### Phase 1: MVP Foundation (Current)
- [x] Basic backend API
- [x] Simple lead form
- [x] In-memory storage
- [x] Lead dashboard view
- [x] Basic email notifications

### Phase 2: Core Features
 - [x] Database integration (PostgreSQL/SQLite)
 - [x] Instagram URL parsing
 - [x] Website URL scraping
 - [x] Business understanding (AI/NLP)
 - [x] Website template generation
 - [x] Booking calendar backend
 - [x] User authentication

### Phase 3: Automation
 - [x] Automated website publishing
 - [x] Lead status automation
 - [x] Email sequences
 - [x] Calendar integration (Google/Outlook)
 - [x] SMS notifications
 - [x] Analytics tracking


### Phase 4: Scale
- [x] Multiple website templates
- [x] Custom branding options
- [x] Voice/chat business setup
- [x] Advanced lead routing
- [x] Team collaboration features
- [x] Payment integration

---

## MVP Constraints

- One website template only
- One lead form design
- Basic email notification
- No advanced automation
- No payment processing
- No multi-user support

---

## Technical Notes

- Backend uses `tsx watch` for hot reload during development
- Frontend uses Next.js Fast Refresh
- CORS configured for `localhost:3000` ↔ `localhost:3001`
- Data stored in memory (array) - will migrate to Postgres
- No environment variables required for local dev yet

---

## Contributing

### Branch Strategy
- `main` - production-ready code
- `dev` - integration branch
- Feature branches: `backend/feature-name` or `frontend/feature-name`

### Commit Convention
- `backend: description` for backend changes
- `frontend: description` for frontend changes
- `shared: description` for shared changes

---

## Questions or Issues?

Contact the team or open an issue in the repository.