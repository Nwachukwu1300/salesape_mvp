# API

The backend is an Express app in `app/backend/src`. This document is a practical map of the current API surface, not a full OpenAPI contract.

Base URL in local development:

```text
http://localhost:3001
```

Most authenticated endpoints expect:

```text
Authorization: Bearer <jwt>
```

Some public endpoints are intentionally unauthenticated and protected by rate limits.

## Route Ownership

Prefer adding new routes under `app/backend/src/routes`.

Current route modules:

| Module | Area |
| --- | --- |
| `routes/auth.ts` | Supabase-backed auth helpers |
| `routes/apeChat.ts` | APE chat route group mounted under `/api/ape` |
| `routes/settings.ts` | User/application settings mounted under `/api/settings` |
| `routes/health.ts` | `/health` database health check |
| `routes/tts.ts` | OpenAI TTS proxy mounted under `/api/tts` |
| `routes/analytics-dashboard.ts` | Dashboard and analytics metrics |
| `routes/scheduling.ts` | Content scheduling |
| `routes/approval-workflow.ts` | Content approval queue and approval history |
| `routes/team-permissions.ts` | Role permissions and permission metadata |

`src/index.ts` still owns many legacy route groups. When touching one of those groups, prefer extracting it into a route module instead of growing `index.ts`.

## Public Routes

These are intended to work without a bearer token:

- `POST /seo-audit-public`
- `POST /free-audit`
- `POST /scrape-website`
- `POST /parse-instagram`
- `POST /analyze-business`
- `POST /free-audit-legacy`
- `GET /businesses/:id/public`
- `POST /businesses/:businessId/public/leads`
- `POST /businesses/:businessId/public/bookings`
- `POST /leads`
- `POST /website/:slug/leads`
- `GET /website/:slug`
- `GET /public/business`
- `GET /calendar/oauth-callback`
- `GET /businesses/:businessId/calendar/availability`

## Auth And Account

Main auth routes:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/revoke`
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/apple`
- `POST /auth/apple/callback`

Additional Supabase auth helpers are in `app/backend/src/routes/auth.ts`.

## Website And Business

Core business/website routes include:

- `GET /businesses`
- `POST /businesses`
- `GET /businesses/:id`
- `PATCH /businesses/:id`
- `DELETE /businesses/:id`
- `POST /businesses/save-business-understanding`
- `POST /generate-website-config`
- `GET /templates`
- `GET /templates/:id`
- `POST /businesses/:id/select-template`
- `POST /businesses/:id/generate-config`
- `POST /businesses/:id/enrich-images`
- `POST /businesses/:id/generate-website`
- `GET /businesses/:id/website-status`
- `GET /businesses/:id/website-config`
- `GET /businesses/:id/template`
- `POST /businesses/:businessId/generate-domain`
- `POST /businesses/:businessId/generate-social-content`

Website versioning and assets:

- `GET /businesses/:businessId/website-versions`
- `POST /businesses/:businessId/website-versions`
- `GET /businesses/:businessId/website-versions/:versionId`
- `PATCH /businesses/:businessId/website-versions/:versionId/publish`
- `DELETE /businesses/:businessId/website-versions/:versionId`
- `POST /businesses/:businessId/website-versions/:versionId/rollback`
- `POST /businesses/:businessId/website-versions/:fromVersion/compare/:toVersion`
- `GET /businesses/:businessId/website-assets`
- `GET /businesses/:businessId/website-assets/:assetId`
- `DELETE /businesses/:businessId/website-assets/:assetId`
- `POST /businesses/:id/assets/upload-image`

## Conversation And Audits

- `POST /conversation/start`
- `POST /conversation/message`
- `GET /conversation/session/:sessionId`
- `POST /conversation/session/:sessionId/complete`
- `POST /seo-audit`
- `POST /seo-audit-public`
- `POST /free-audit`

## Leads, Bookings, Calendar, And Follow-Up

- `POST /businesses/:businessId/leads`
- `GET /businesses/:businessId/leads`
- `PATCH /businesses/:businessId/leads/:leadId`
- `GET /businesses/:businessId/leads-filtered`
- `POST /businesses/:businessId/leads/:leadId/send-sms`
- `POST /businesses/:businessId/bookings`
- `GET /businesses/:businessId/bookings`
- `DELETE /businesses/:businessId/bookings/:bookingId`
- `POST /businesses/:businessId/bookings/:bookingId/send-sms-confirmation`
- `POST /businesses/:businessId/available-slots`
- `GET /businesses/:businessId/available-slots`
- `POST /businesses/:businessId/connect-google-calendar`
- `GET /businesses/:businessId/calendar/freebusy`
- `POST /businesses/:businessId/calendar/events`
- `POST /businesses/:businessId/calendar/connect-google`
- `POST /businesses/:businessId/calendar/sync-bookings`
- `GET /businesses/:businessId/calendar/availability`
- `POST /businesses/:businessId/email-sequences`
- `GET /businesses/:businessId/email-sequences`
- `POST /businesses/:businessId/lead-routing`
- `GET /businesses/:businessId/lead-routing`
- `PATCH /lead-routing/:ruleId`

## Content Studio

Content input and repurposing:

- `POST /businesses/:businessId/content-inputs/upload`
- `POST /businesses/:businessId/content-inputs`
- `GET /businesses/:businessId/content-inputs`
- `GET /businesses/:businessId/content-inputs/:contentId`
- `PATCH /businesses/:businessId/content-inputs/:contentId`
- `DELETE /businesses/:businessId/content-inputs/:contentId`
- `POST /businesses/:businessId/content-inputs/:contentId/repurpose`
- `GET /businesses/:businessId/repurposed-content`
- `GET /businesses/:businessId/repurposed-content/:repurposedId`
- `PATCH /businesses/:businessId/repurposed-content/:repurposedId`
- `DELETE /businesses/:businessId/repurposed-content/:repurposedId`
- `POST /businesses/:businessId/repurposed-content/:repurposedId/publish`

Distributions and projects:

- `GET /businesses/:businessId/distributions`
- `GET /businesses/:businessId/distributions/:distributionId`
- `PATCH /businesses/:businessId/distributions/:distributionId`
- `DELETE /businesses/:businessId/distributions/:distributionId`
- `POST /businesses/:businessId/publish`
- `POST /businesses/:businessId/content-projects`
- `GET /businesses/:businessId/content-projects`
- `GET /businesses/:businessId/content-projects/:projectId`
- `DELETE /businesses/:businessId/content-projects/:projectId`
- `POST /reel/:reelId/publish`
- `GET /reel/:reelId/analytics`

## Analytics, Scheduling, Approval, And Team Permissions

Analytics:

- `GET /businesses/:businessId/usage`
- `GET /businesses/:businessId/analytics`
- `POST /businesses/:businessId/analytics`
- `GET /dashboard/stats`
- `GET /dashboard/seo-rankings`
- `GET /businesses/:businessId/dashboard`
- `GET /businesses/:businessId/analytics/by-platform/:platform`
- `GET /businesses/:businessId/analytics/trends`
- `POST /businesses/:businessId/analytics/compare`
- `GET /businesses/:businessId/analytics/revenue`

Scheduling:

- `GET /businesses/:businessId/schedule`
- `POST /businesses/:businessId/schedule`
- `GET /businesses/:businessId/schedule/calendar`
- `PUT /businesses/:businessId/schedule/:scheduledPostId`
- `DELETE /businesses/:businessId/schedule/:scheduledPostId`
- `POST /businesses/:businessId/schedule/bulk`
- `GET /businesses/:businessId/schedule/upcoming`
- `GET /businesses/:businessId/schedule/stats`

Approval:

- `GET /businesses/:businessId/approval-queue`
- `POST /businesses/:businessId/repurposed-content/:repurposedContentId/approve`
- `POST /businesses/:businessId/repurposed-content/:repurposedContentId/reject`
- `GET /businesses/:businessId/repurposed-content/:repurposedContentId/approval-history`
- `GET /businesses/:businessId/approval-stats`
- `POST /businesses/:businessId/approval/bulk`

Team:

- `POST /businesses/:businessId/team`
- `POST /businesses/:businessId/team/invite`
- `GET /businesses/:businessId/team/members`
- `PUT /businesses/:businessId/team/members/:memberId/role`
- `DELETE /businesses/:businessId/team/members/:memberId`
- `GET /businesses/:businessId/team/permissions`
- `GET /team/role-descriptions`
- `GET /team/permissions-matrix`

## Other Integrations

- `GET /websites/questions`
- `POST /websites/questionnaire`
- `POST /websites/questionnaire/submit`
- `POST /websites/chat`
- `GET /businesses/:businessId/subscription`
- `GET /businesses/:businessId/payments`
- `POST /businesses/:businessId/payments`
- `GET /api/beyond/config`
- `GET /api/beyond/agents`
- `POST /api/beyond/call`
- `POST /api/beyond/openai/v1/chat/completions`
- `POST /api/tts`

## Error Shape

Most handlers return JSON with either:

```json
{ "success": true, "data": {} }
```

or:

```json
{ "error": "Human readable message" }
```

Legacy routes are not perfectly uniform yet. When adding or extracting routes, prefer the shapes above.
