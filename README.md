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

**Backend (Your Focus)**
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

**MVP v0.1 (Current)**
- Basic lead capture form
- Lead storage (in-memory)
- Simple API for lead management
- Health check endpoint
- CORS enabled for local development

**Limitations**
- Data resets on server restart (in-memory only)
- No database persistence
- No authentication
- No email notifications yet
- Single static form (no dynamic generation)

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
- [ ] Database integration (PostgreSQL)
- [ ] Instagram URL parsing
- [ ] Website URL scraping
- [ ] Business understanding (AI/NLP)
- [ ] Website template generation
- [ ] Booking calendar backend
- [ ] User authentication

### Phase 3: Automation
- [ ] Automated website publishing
- [ ] Lead status automation
- [ ] Email sequences
- [ ] Calendar integration (Google/Outlook)
- [ ] SMS notifications
- [ ] Analytics tracking

### Phase 4: Scale
- [ ] Multiple website templates
- [ ] Custom branding options
- [ ] Advanced lead routing
- [ ] Team collaboration features
- [ ] Payment integration
- [ ] Voice/chat business setup

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