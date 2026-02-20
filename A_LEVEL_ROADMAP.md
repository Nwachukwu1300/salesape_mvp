# A-Level Launch Roadmap
**Target Grade**: A (90+/100)  
**Current Grade**: A- (84/100)  
**Gap**: 6 points needed  
**Priority**: Security > Dashboard > Automation > Intelligence

---

## 🔴 CRITICAL (Security) — 3 Points

### Task 1: XSS & Injection Protection Layer
**Why**: Prevents malicious HTML/scripts in generated websites  
**Effort**: 4-6 hours  
**Files to create/modify**:
- Create: `app/backend/src/utils/content-sanitizer.ts`
- Modify: `app/backend/src/website-config/index.ts` (use sanitizer)
- Modify: `app/frontend/src/screens/WebsitePreview.tsx` (DOM safety)

**Implementation outline**:
```typescript
// content-sanitizer.ts
export function sanitizeGeneratedHTML(html: string): string {
  // Strip <script> tags
  // Remove onclick, onerror, onload attributes
  // Block data: URIs in images
  // Escape inline styles
  // Remove SVG xlink:href injection vectors
}

// Use in website config generation
const cleanConfig = {
  ...config,
  sections: config.sections.map(s => ({
    ...s,
    content: sanitizeGeneratedHTML(s.content)
  }))
}
```

---

### Task 2: Scraper Security Hardening
**Why**: Prevent using service as open proxy or scraper abuse  
**Effort**: 2-3 hours  
**Files to modify**:
- `app/backend/src/index.ts` (update `/scrape-website` endpoint)
- Create: `app/backend/src/utils/scraper-validator.ts`

**Implementation outline**:
```typescript
// scraper-validator.ts
export function validateScraperURL(url: string): {valid: boolean; error?: string} {
  // Block private IPs: 10.0.0.0, 172.16.0.0, 192.168.0.0, 127.0.0.1, 0.0.0.0
  // Block localhost variants
  // Enforce https:// for public sites
  // Max timeout: 5 seconds
  // Max redirects: 3
  // Max HTML size: 2MB (already done)
}
```

---

### Task 3: Prompt Injection Detection
**Why**: Prevent user input from corrupting AI output structure  
**Effort**: 2-3 hours  
**Files to create**:
- Create: `app/backend/src/utils/prompt-safety.ts`
- Modify: `app/backend/src/index.ts` (conversation/message endpoint)

**Implementation outline**:
```typescript
// prompt-safety.ts
export function detectPromptInjection(userInput: string): boolean {
  const injectionPatterns = [
    /ignore previous instructions/i,
    /system override/i,
    /forget about/i,
    /new instructions/i,
    /root|admin|sudo/i,
    /execute|run command/i,
  ];
  
  return injectionPatterns.some(p => p.test(userInput));
}

// Use in conversation message endpoint
if (detectPromptInjection(userInput)) {
  // Either block or flag for review
}
```

---

## 🟡 IMPORTANT (Dashboard) — 2.5 Points

### Task 4: Dashboard KPI Widgets
**Why**: Business owners need visibility into performance  
**Effort**: 5-7 hours  
**Files to create/modify**:
- Modify: `app/frontend/src/screens/Dashboard.tsx`
- Create: `app/frontend/src/components/DashboardWidgets/` (4 new components)

**Implementation outline**:

Components to build:
1. **WebsiteCountWidget** - Shows "3 Websites Created"
2. **LeadCountWidget** - Shows "24 Total Leads" with trend
3. **BookingCountWidget** - Shows "8 Bookings This Month"
4. **SEOScoreWidget** - Shows average SEO score of all sites

```tsx
// Example structure
export const DashboardSection = ({ businesses }) => {
  const stats = {
    websites: businesses.length,
    leads: sumLeadsByStatus(businesses, 'new'),
    bookings: sumBookingsByMonth(businesses, currentMonth),
    avgSeoScore: averageScore(businesses),
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <WebsiteCountWidget count={stats.websites} />
      <LeadCountWidget count={stats.leads} />
      <BookingCountWidget count={stats.bookings} />
      <SEOScoreWidget score={stats.avgSeoScore} />
    </div>
  );
};
```

---

### Task 5: Dashboard Action CTAs
**Why**: Clear next steps for business owner  
**Effort**: 2-3 hours  
**Files to modify**:
- Modify: `app/frontend/src/screens/Dashboard.tsx`

**Implementation outline**:

Add button bar to each website card:
1. "📊 Improve SEO" → Route to `/seo-audit/:id`
2. "🏗️ Regenerate with Template" → Show template picker modal
3. "📱 View Live" → Open published URL
4. "⚙️ Settings" → Edit business info

---

## 🟡 IMPORTANT (Automation) — 2 Points

### Task 6: Lead Auto-Email Sequences
**Why**: Lead follow-up is manual → needs to be automatic  
**Effort**: 6-8 hours  
**Files to create/modify**:
- Create: `app/backend/src/workers/email-sequence.worker.ts`
- Modify: `app/backend/src/index.ts` (add lead creation hook)
- Modify: `app/backend/src/queues/index.ts` (add email queue)

**Implementation outline**:

Flow:
1. New lead created → enqueue email job
2. Wait X minutes (from EmailSequence.delayMinutes)
3. Send email via SendGrid
4. Update Lead.status to "contacted"
5. After 3 days with no response → send reminder

```typescript
// Worker pseudocode
async function processEmailSequence(leadId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  const sequences = await prisma.emailSequence.findMany({
    where: { 
      businessId: lead.businessId,
      triggerEvent: 'lead_created',
      isActive: true 
    }
  });
  
  for (const seq of sequences) {
    await sendEmailViaQueue(lead, seq);
  }
}
```

---

### Task 7: Booking Reminders
**Why**: No-shows decrease → SMS/email 24hr before  
**Effort**: 3-4 hours  
**Files to create**:
- Create: `app/backend/src/workers/booking-reminder.worker.ts`
- Modify: `app/backend/src/queues/index.ts`

**Implementation outline**:

Daily worker checks for bookings in next 24 hours, sends SMS + email reminder.

---

## 🟡 NICE-TO-HAVE (Intelligence) — 1.5 Points

### Task 8: JSON-LD Schema Markup Auto-Generation
**Why**: Improves Lighthouse score + SEO  
**Effort**: 3-4 hours  
**Files to create**:
- Create: `app/backend/src/utils/schema-generator.ts`
- Modify: `app/backend/src/website-config/index.ts`

**Implementation outline**:

```typescript
// schema-generator.ts
export function generateSchemaMarkup(business: BusinessUnderstanding) {
  return {
    "@context": "https://schema.org",
    "@type": detectSchemaType(business.category), // LocalBusiness, Service, LegalService, etc.
    "name": business.name,
    "description": business.description,
    "telephone": business.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address,
      "addressLocality": extractCity(business.location),
      "postalCode": extractZip(business.location)
    },
    "areaServed": business.location,
    "priceRange": "$$$", // Could be smarter
  };
}

// In website config
config.meta.schemaMarkup = generateSchemaMarkup(business);
```

---

### Task 9: Lighthouse Optimization Pass
**Why**: Improves SEO score + loading speed  
**Effort**: 2-3 hours  
**Files to create**:
- Create: `app/backend/src/utils/lighthouse-optimizer.ts`
- Modify: `app/backend/src/website-config/index.ts`

**Implementation outline**:

```typescript
// lighthouse-optimizer.ts
export function optimizeForLighthouse(config: WebsiteConfig): WebsiteConfig {
  return {
    ...config,
    meta: {
      ...config.meta,
      // Add missing meta tags
      viewport: "width=device-width, initial-scale=1",
      charset: "utf-8",
      "og:image": config.imageAssets?.hero,
      "og:title": config.meta.title,
    },
    // Optimize images for performance
    imageAssets: optimizeImages(config.imageAssets),
  };
}

function optimizeImages(assets: ImageAssets) {
  // Lazy load all images
  // Serve in WebP format
  // Add loading="lazy" attributes
  // Generate responsive srcsets
}
```

---

## 📋 Implementation Priority Matrix

| Task | Points | Effort | Security | Impact | Priority |
|------|--------|--------|----------|--------|----------|
| XSS/Injection Filter | 1.5 | 4h | **CRITICAL** | Content safety | **1st** |
| Scraper Validation | 1.0 | 2h | **HIGH** | Abuse prevention | **2nd** |
| Prompt Injection Detect | 1.0 | 2h | **MEDIUM** | Data integrity | **3rd** |
| Dashboard KPIs | 1.5 | 6h | Low | User visibility | **4th** |
| Action CTAs | 1.0 | 2h | Low | UX flow | **5th** |
| Lead Email Sequences | 1.5 | 7h | Low | Revenue impact | **6th** |
| Booking Reminders | 0.5 | 3h | Low | Conversion | **7th** |
| Schema Markup | 1.0 | 3h | Low | SEO boost | **8th** |
| Lighthouse Optimizer | 0.5 | 2h | Low | Performance | **9th** |

---

## 🎯 To Hit A (90+) in 1 Week

**Week 1 (Priority: Security)**
- [ ] XSS/Injection protection (4h)
- [ ] Scraper URL validation (2h)
- [ ] Prompt injection detection (2h)
- ✅ **+3 points earned** (84 → 87)

**Week 2 (Priority: Dashboard)**
- [ ] Dashboard KPI widgets (6h)
- [ ] Action CTAs on cards (2h)
- ✅ **+2.5 points earned** (87 → 89.5)

**Week 3 (Priority: Automation)**
- [ ] Lead email sequences (7h)
- [ ] Booking reminders (3h)
- ✅ **+2 points earned** (89.5 → 91.5)

---

## 📝 Files Checklist

**To create (5 new files)**:
- [ ] `app/backend/src/utils/content-sanitizer.ts`
- [ ] `app/backend/src/utils/scraper-validator.ts`
- [ ] `app/backend/src/utils/prompt-safety.ts`
- [ ] `app/backend/src/workers/email-sequence.worker.ts`
- [ ] `app/backend/src/workers/booking-reminder.worker.ts`

**To modify (6 files)**:
- [ ] `app/backend/src/index.ts` (hooks for lead creation, booking reminders)
- [ ] `app/frontend/src/screens/Dashboard.tsx` (widgets + CTAs)
- [ ] `app/backend/src/website-config/index.ts` (sanitizer, schema, lighthouse)
- [ ] `app/backend/src/queues/index.ts` (email queue)
- [ ] `app/frontend/src/components/` (create DashboardWidgets/)

---

## 🚀 Ready to Execute?

Pick 3 tasks from **Week 1** and let's build them today.

Estimated timeline to A: **10-12 days of implementation**

