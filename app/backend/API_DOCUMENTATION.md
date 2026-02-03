# SalesAPE Backend API Documentation

## Database Setup

### Prerequisites
- PostgreSQL 12+ installed and running
- Environment variables configured in `.env` file

### Configuration
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/salesape_dev"
```

3. Generate Prisma Client and apply migrations:
```bash
npx prisma migrate dev --name init
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register
- **URL:** `POST /auth/register`
- **Auth:** None
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```
- **Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Login
- **URL:** `POST /auth/login`
- **Auth:** None
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
- **Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

## Public Endpoints (No Auth Required)

### Health Check
- **URL:** `GET /health`
- **Response:**
```json
{ "ok": true }
```

### Scrape Website
- **URL:** `POST /scrape-website`
- **Body:**
```json
{
  "url": "https://example.com"
}
```
- **Response (200):**
```json
{
  "title": "Website Title",
  "description": "Meta description",
  "email": "contact@example.com",
  "phone": "+1-555-123-4567"
}
```

### Parse Instagram URL
- **URL:** `POST /parse-instagram`
- **Body:**
```json
{
  "url": "https://instagram.com/username"
}
```
- **Response (200):**
```json
{
  "username": "username"
}
```

### Analyze Business
- **URL:** `POST /analyze-business`
- **Body:**
```json
{
  "description": "I'm a hairstylist offering cuts and coloring",
  "scraped": {
    "title": "John's Hair Salon",
    "description": "Professional hair services"
  }
}
```
- **Response (200):**
```json
{
  "Business type": "salon",
  "Main services offered": ["haircuts", "coloring", "styling"],
  "Branding cues": "professional, modern",
  "Any contact info": "john@example.com"
}
```

## Protected Endpoints (Auth Required)

### Create Business
- **URL:** `POST /businesses`
- **Auth:** Required
- **Body:**
```json
{
  "url": "https://example.com",
  "name": "My Business",
  "description": "Business description"
}
```
- **Response (201):**
```json
{
  "id": "business_id",
  "userId": "user_id",
  "name": "My Business",
  "url": "https://example.com",
  "description": "Business description",
  "publishedUrl": "https://1234567890.salesape.app/website",
  "analysis": { ... },
  "createdAt": "2026-02-02T12:00:00.000Z",
  "updatedAt": "2026-02-02T12:00:00.000Z"
}
```

### Get All Businesses
- **URL:** `GET /businesses`
- **Auth:** Required
- **Response (200):** Array of business objects with leads and bookings

### Get Business by ID
- **URL:** `GET /businesses/:id`
- **Auth:** Required (must own the business)
- **Response (200):** Business object with all relations

### Get Business Template
- **URL:** `GET /businesses/:id/template`
- **Auth:** Required (must own the business)
- **Response (200):**
```json
{
  "templates": [
    {
      "id": "modern",
      "name": "Modern Professional",
      "preview": "/templates/modern.png",
      "style": { ... },
      "sections": [ ... ]
    },
    { ... }
  ],
  "recommended": { ... },
  "businessType": "salon",
  "analysis": { ... }
}
```

## Lead Management

### Create Lead
- **URL:** `POST /businesses/:businessId/leads`
- **Auth:** Required (must own the business)
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "message": "Interested in your services"
}
```
- **Response (201):** Lead object

### Get Leads
- **URL:** `GET /businesses/:businessId/leads`
- **Auth:** Required (must own the business)
- **Response (200):** Array of lead objects

## Booking Management

### Create Booking
- **URL:** `POST /businesses/:businessId/bookings`
- **Auth:** Required (must own the business)
- **Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "date": "2026-02-15",
  "time": "14:00"
}
```
- **Response (201):** Booking object
- **Note:** Returns 409 if time slot unavailable or already booked

### Get Bookings
- **URL:** `GET /businesses/:businessId/bookings`
- **Auth:** Required (must own the business)
- **Response (200):** Array of booking objects

## Availability Management

### Set Available Slots
- **URL:** `POST /businesses/:businessId/available-slots`
- **Auth:** Required (must own the business)
- **Body:**
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00"
}
```
- **Note:** dayOfWeek is 0-6 (Sunday-Saturday). Replaces existing slot for that day.
- **Response (201):** Available slot object

### Get Available Slots
- **URL:** `GET /businesses/:businessId/available-slots`
- **Auth:** Required (must own the business)
- **Response (200):** Array of available slot objects

## Legacy Endpoints

### Public Lead Submission
- **URL:** `POST /leads`
- **Auth:** None
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "message": "Test message"
}
```
- **Response (201):** Lead object

## Error Responses

### 400 Bad Request
```json
{ "error": "Description of what's required" }
```

### 401 Unauthorized
```json
{ "error": "Access token required" }
```

### 403 Forbidden
```json
{ "error": "Unauthorized" }
```

### 404 Not Found
```json
{ "error": "Business not found" }
```

### 409 Conflict
```json
{ "error": "Time slot already booked" }
```

### 500 Internal Server Error
```json
{ "error": "Operation failed" }
```

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  password: string (hashed);
  name: string;
  businesses: Business[];
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Business
```typescript
{
  id: string;
  userId: string;
  name: string;
  url: string;
  description?: string;
  logo?: string;
  publishedUrl?: string;
  analysis?: JSON;
  leads: Lead[];
  bookings: Booking[];
  availableSlots: AvailableSlot[];
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Lead
```typescript
{
  id: string;
  businessId: string;
  name: string;
  email: string;
  company?: string;
  message?: string;
  createdAt: DateTime;
}
```

### Booking
```typescript
{
  id: string;
  businessId: string;
  name: string;
  email: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: string; // "confirmed"
  createdAt: DateTime;
}
```

### AvailableSlot
```typescript
{
  id: string;
  businessId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

## Example Usage

### Registration and Login
```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Business
```bash
curl -X POST http://localhost:3001/businesses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "url": "https://example.com",
    "name": "My Salon",
    "description": "Professional hair salon"
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:3001/businesses/<businessId>/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "date": "2026-02-15",
    "time": "14:00"
  }'
```

### Set Availability
```bash
# Set Monday (1) availability from 9 AM to 5 PM
curl -X POST http://localhost:3001/businesses/<businessId>/available-slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00"
  }'
```
