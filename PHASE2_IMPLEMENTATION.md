# Phase 2 Implementation Guide

## What's New in Phase 2

### ✅ Complete Features

#### 1. Database Integration (PostgreSQL)
- **Status:** Full Prisma integration
- **Models:** User, Business, Lead, Booking, AvailableSlot
- **Features:**
  - Complete data persistence
  - Relationships between users, businesses, leads, and bookings
  - Unique constraints on bookings (no double-booking)
  - Query optimization with indexes

#### 2. User Authentication
- **Status:** JWT-based authentication with password hashing
- **Endpoints:**
  - `POST /auth/register` - Create new user account
  - `POST /auth/login` - Authenticate and receive JWT token
- **Features:**
  - bcryptjs password hashing
  - JWT tokens with 7-day expiry
  - Secure password comparison
  - Email uniqueness validation

#### 3. Business Model in Database
- **Status:** Complete Prisma schema with full relationships
- **Models:**
  - User: Core user account
  - Business: User-owned business with all metadata
  - Lead: Leads captured for a business
  - Booking: Scheduled bookings for a business
  - AvailableSlot: Business availability schedule
- **Features:**
  - Cascade delete for data integrity
  - Ownership verification on all endpoints
  - Metadata storage (analysis, branding, etc.)

#### 4. Booking Availability & Conflict Detection
- **Status:** Full implementation with conflict prevention
- **Features:**
  - `isTimeSlotAvailable()` function checks for conflicts
  - Unique constraint on (businessId, date, time) tuple
  - Available slots management by day of week
  - Time slot validation against business hours
  - Returns 409 Conflict when slot unavailable

### Protected Endpoints (Authentication Required)

All business, booking, and lead endpoints are protected with JWT authentication middleware. The middleware:
- Extracts token from `Authorization: Bearer <token>` header
- Verifies token signature and expiry
- Returns 401 if no token present
- Returns 403 if token invalid or expired
- Injects userId into request object

### Ownership Verification

All protected endpoints verify that the authenticated user owns the resource:
- User can only access their own businesses
- User can only manage leads/bookings for their businesses
- Attempting to access other users' resources returns 403 Forbidden

### Key Implementation Details

#### Password Hashing
```typescript
// Registration
const hashedPassword = await bcrypt.hash(password, 10);
const user = await prisma.user.create({
  data: { email, password: hashedPassword, name }
});

// Login
const passwordMatch = await bcrypt.compare(password, user.password);
```

#### JWT Token Generation
```typescript
const token = jwt.sign(
  { userId: user.id, email: user.email },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

#### Booking Conflict Detection
```typescript
async function isTimeSlotAvailable(businessId, date, time) {
  // Check if exact time slot is booked
  const existingBooking = await prisma.booking.findUnique({
    where: { businessId_date_time: { businessId, date, time } }
  });
  
  if (existingBooking) return false;
  
  // Check if within available hours
  const dayOfWeek = new Date(date).getDay();
  const availableSlots = await prisma.availableSlot.findMany({
    where: { businessId, dayOfWeek }
  });
  
  // Validate time is within slots
  // ...
  return true;
}
```

## Database Schema

### User Table
```sql
CREATE TABLE "User" (
  id String @id @default(cuid())
  email String @unique
  password String (hashed with bcrypt)
  name String
  businesses Business[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
);
```

### Business Table
```sql
CREATE TABLE "Business" (
  id String @id @default(cuid())
  userId String (foreign key to User)
  name String
  url String
  description String?
  logo String?
  publishedUrl String?
  analysis Json? (AI analysis results)
  leads Lead[]
  bookings Booking[]
  availableSlots AvailableSlot[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
);
```

### Lead Table
```sql
CREATE TABLE "Lead" (
  id String @id @default(cuid())
  businessId String (foreign key to Business)
  name String
  email String
  company String?
  message String?
  createdAt DateTime @default(now())
);
```

### Booking Table
```sql
CREATE TABLE "Booking" (
  id String @id @default(cuid())
  businessId String (foreign key to Business)
  name String
  email String
  date String (YYYY-MM-DD)
  time String (HH:mm)
  status String @default("confirmed")
  createdAt DateTime @default(now())
  
  @@unique([businessId, date, time]) -- Prevents double-booking
);
```

### AvailableSlot Table
```sql
CREATE TABLE "AvailableSlot" (
  id String @id @default(cuid())
  businessId String (foreign key to Business)
  dayOfWeek Int (0-6, Sunday-Saturday)
  startTime String (HH:mm format)
  endTime String (HH:mm format)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
);
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd app/backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with:
```
DATABASE_URL="postgresql://username:password@localhost:5432/salesape_dev"
JWT_SECRET="your-secret-key-here"
```

### 3. Create Database
```bash
npx prisma migrate dev --name init
```

This will:
- Create the database if it doesn't exist
- Run all migrations
- Generate Prisma Client

### 4. Run Backend
```bash
npm run dev
```

## Testing the API

### Test Authentication
```bash
# Register new user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Test Protected Endpoints
```bash
# Create business (replace TOKEN with actual token)
curl -X POST http://localhost:3001/businesses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "url": "https://example.com",
    "name": "My Business"
  }'

# Get all businesses
curl -X GET http://localhost:3001/businesses \
  -H "Authorization: Bearer TOKEN"
```

### Test Booking with Availability
```bash
# Set Monday availability
curl -X POST http://localhost:3001/businesses/BUSINESS_ID/available-slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00"
  }'

# Create booking
curl -X POST http://localhost:3001/businesses/BUSINESS_ID/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "date": "2026-02-03",
    "time": "14:00"
  }'

# Try double-booking (should fail with 409)
curl -X POST http://localhost:3001/businesses/BUSINESS_ID/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "date": "2026-02-03",
    "time": "14:00"
  }'
```

## Migration from Old In-Memory System

### Breaking Changes
1. **All endpoints now require authentication** (except public ones)
2. **Business endpoints require ownership verification**
3. **Bookings have unique constraint** on (businessId, date, time)
4. **Database persistence required** (no more data loss on restart)

### Non-Breaking Changes
1. **Legacy `/leads` endpoint** still works without auth
2. **Public analysis endpoints** unchanged
3. **Response formats** are backward compatible

### Data Migration
If you have data in the old in-memory system:
1. Export data from the old system
2. Create a migration script using Prisma
3. Import data into PostgreSQL

Example migration script:
```typescript
async function migrate() {
  // For each user in old system
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name }
  });
  
  // For each business
  const business = await prisma.business.create({
    data: { userId: user.id, ...businessData }
  });
  
  // For each lead
  await prisma.lead.create({
    data: { businessId: business.id, ...leadData }
  });
  
  // For each booking
  await prisma.booking.create({
    data: { businessId: business.id, ...bookingData }
  });
}
```

## Next Steps (Phase 3)

Pending features for Phase 3:
- [ ] Email notifications for new leads
- [ ] Automated website publishing
- [ ] Lead status automation
- [ ] Google/Outlook calendar integration
- [ ] SMS notifications
- [ ] Analytics tracking
- [ ] Multiple website templates
- [ ] Advanced lead routing
- [ ] Payment integration

## Troubleshooting

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Database Connection Error
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env
3. Verify credentials and host

### Migration Conflicts
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually fix:
npx prisma migrate resolve --rolled-back init
npx prisma migrate dev --name init
```

### JWT Token Issues
1. Ensure JWT_SECRET is set in .env
2. Token expiry is 7 days - refresh by logging in again
3. Check Authorization header format: `Authorization: Bearer <token>`

## Performance Considerations

1. **Database Indexes:** Prisma creates indexes on foreign keys automatically
2. **Query Optimization:** Use `include` to fetch relations efficiently
3. **N+1 Problems:** All relations are eagerly loaded where appropriate
4. **Booking Conflicts:** Unique constraint prevents race conditions at DB level

## Security Notes

1. **Password Hashing:** bcryptjs with salt rounds 10
2. **JWT Secret:** Change from default in production!
3. **CORS:** Currently allows all origins - restrict in production
4. **SQL Injection:** Protected by Prisma parameterized queries
5. **Authentication:** All business endpoints protected by middleware
