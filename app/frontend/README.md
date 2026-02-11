# SalesAPE.ai UI/UX Design System

Complete design system and UI component library for SalesAPE.ai. This is a React + Vite application serving the Figma design at https://www.figma.com/design/s7ZtY6CrjaYay6VzI92DCI/SalesAPE.ai-UI-UX-Design.

## Overview

`figma-export` is a Vite-powered React app that exports and implements SalesAPE's design system. It includes:
- Complete component library (Button, Input, Card, etc.)
- Authentication screens (with Google OAuth & Apple Sign-In)
- Dashboard layouts
- Subscription context (wired to backend)
- Theme toggling (light/dark mode)

## Running the Code

### Install Dependencies
```bash
npm install
```

### Start Development Server (Port 3002)
```bash
npm run dev
```

The app will be available at **http://localhost:3002**

### Build for Production
```bash
npm run build
```

## Features

### Authentication (AuthContext)
- Email/password sign-in and sign-up
- **Google OAuth 2.0** integration
- **Apple Sign-In** support
- JWT token management
- Password reset flow

### Subscription Management (SubscriptionContext)
- Live subscription plan tracking
- Usage metrics:
  - Websites created
  - Leads captured
  - SEO audits used
- Plan limits enforcement
- Connected to backend: `GET /businesses/:businessId/subscription` and `GET /businesses/:businessId/usage`

### Environment Configuration
```bash
# .env (or .env.local for local development)
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-key>
```

### Backend Requirements

For OAuth to work, configure your backend `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:3002/auth/callback

# Apple Sign-In
APPLE_CLIENT_ID=<your-apple-team-id.com.salesape.app>
APPLE_REDIRECT_URI=http://localhost:3002/auth/callback

# Frontend URL (for OAuth redirects) - figma-export is the main frontend
FRONTEND_URL=http://localhost:3002
```

## Architecture

```
figma-export/
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # AuthContext, SubscriptionContext
│   ├── screens/           # Full-page screens (AuthScreen, etc.)
│   ├── pages/             # Route pages (auth/callback.tsx, etc.)
│   ├── lib/               # Utilities (Stripe, API helpers)
│   ├── styles/            # Global styles
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
└── package.json
```

## Port Configuration

- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:3001  
- **Design System (figma-export)**: http://localhost:3002 ← **You are here**

## Deployment

The design system can be deployed as a standalone app or integrated into the main frontend. It's built with Vite for fast development and optimized production builds.

## Related Documentation

- Main README: [../README.md](../README.md)
- Backend API Docs: [../app/backend/API_DOCUMENTATION.md](../app/backend/API_DOCUMENTATION.md)
- Frontend: [../app/frontend/README.md](../app/frontend/README.md)