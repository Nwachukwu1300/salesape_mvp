# Quick Run Guide - SalesAPE MVP

## Prerequisites
- Node.js 18+ installed
- npm installed
- Database URL configured in `app/backend/.env`

## Running the Application Locally

### Terminal 1: Start Backend Server
```bash
cd app/backend
npm install
npx tsx src/index.ts
```

Expected output:
```
Server running on port 3001
```

### Terminal 2: Start Frontend Dev Server
```bash
cd app/frontend
npm install
npx next dev
```

Expected output:
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Project Structure

### Frontend (Next.js 16.1.4)
- Location: `app/frontend`
- UI Components: `app/frontend/components/ui/*` (Button, Input, Select, ColorPicker, Checkbox, etc.)
- Pages: `app/frontend/app/*`
- Features:
  - Business Onboarding with AI analysis
  - Website Templates
  - Lead Management Dashboard
  - Booking Calendar
  - Team Management
  - Lead Routing Rules
  - Subscription/Payment Management
  - Custom Branding Options

### Backend (Express + Prisma)
- Location: `app/backend`
- Database: SQLite (development) / PostgreSQL (production via Supabase)
- API Endpoints:
  - `/api/auth/*` - Authentication
  - `/api/businesses/*` - Business management
  - `/api/leads/*` - Lead management
  - `/api/bookings/*` - Booking system
  - `/api/teams/*` - Team collaboration
  - `/api/lead-routing/*` - Lead assignment rules
  - `/api/subscriptions/*` - Subscription management
  - `/api/payments/*` - Payment processing

## Recent Updates (Phase 4)

### UI Component Library
- Created shadcn-style component system
- Components: Button, Input, Textarea, Select, ColorPicker, Checkbox
- Sonner for toast notifications
- Skeleton loading states for better UX
- Micro-interactions with CSS animations

### Key Features Implemented
1. **Voice/Chat Onboarding** - Describe business via voice or chat
2. **Website Templates** - Multiple template options with AI recommendations
3. **Custom Branding** - Color picker, font selection, logo upload
4. **Team Collaboration** - Invite members with role-based access
5. **Lead Routing** - Intelligent lead assignment based on rules
6. **Subscription Tiers** - Payment integration ready
7. **Lead Dashboard** - Real-time lead tracking with analytics

### Database Schema
- Prisma ORM with latest migrations
- Tables: Users, Businesses, Leads, Bookings, Teams, LeadRoutingRules, Subscriptions, Payments
- Encryption support for sensitive data

## Troubleshooting

### Backend won't start
1. Check `.env` file exists and has valid DATABASE_URL
2. Verify `node_modules` installed: `npm install`
3. Ensure port 3001 is available: `netstat -ano | findstr :3001` (Windows)

### Frontend compilation errors
1. Clear `.next` folder: `rm -rf .next`
2. Reinstall: `npm install`
3. Run: `npx tsc --noEmit` to check TypeScript

### Database connection issues
1. Verify DATABASE_URL in `.env`
2. Test connection: `npx prisma db push`
3. Check network/firewall settings

## Development Commands

### Backend
```bash
npm run dev              # Start dev server with tsx
npx prisma generate     # Regenerate Prisma Client
npx prisma db push      # Sync schema with database
```

### Frontend
```bash
npm run dev             # Start Next.js dev server
npm run build           # Build for production
npm run lint            # Run ESLint
npx tsc --noEmit        # Check TypeScript
```

## API Testing

### Using curl (Windows PowerShell)
```powershell
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "name":"Test User"
  }'
```

## Notes
- All API responses include proper error handling
- Rate limiting enabled on most endpoints
- JWT authentication for protected routes
- CORS enabled for frontend origin
- Email notifications (Twilio SMS ready)
- Google Calendar integration available

For more details, see the full documentation in `README.md` and `API_DOCUMENTATION.md`.
