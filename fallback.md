# SalesAPE Fallback Guide (Non-Technical)

This file explains what happens when parts of the app fail, in plain language.

## What is a fallback?
A fallback is a backup path.
If the first option fails (for example, AI service is down or slow), the app switches to a safer backup so the user can continue.

## 1) Conversation question fallback
### Normal behavior
APE uses AI to ask the next onboarding question.

### If it fails
The app asks a built-in backup question from a fixed list of 7 required questions.

### Why this helps
Your onboarding does not stop. Users can always continue.

## 2) Invalid answer fallback
### Normal behavior
User answers a question, and the app moves forward.

### If answer is missing or unclear
APE sends a simple correction message and repeats the same required question.

### Why this helps
The user is guided back on track instead of getting stuck.

## 3) Summary generation fallback
### Normal behavior
At the end, AI writes a final business summary.

### If AI summary fails
The app creates the summary using a built-in formatter (plain text).

### Why this helps
User still gets a full summary and can proceed to generation.

## 4) Business understanding refinement fallback
### Normal behavior
AI refines collected business details for better website generation quality.

### If refinement fails
The app keeps the original user-provided details and continues.

### Why this helps
No data is lost and generation can still move forward.

## 5) Voice (TTS) fallback in conversation
### Normal behavior
OpenAI voice audio plays the question.

### Backup behavior
The browser's built-in voice starts immediately.
If OpenAI voice arrives, it can switch to that.
If OpenAI fails, browser voice continues.

### Why this helps
Users still hear questions even when OpenAI audio is unavailable.

## 6) Streaming fallback
### Normal behavior
AI text appears gradually (token-by-token) like live typing.

### If streaming fails
The app falls back to a normal non-stream response or a built-in question/summary.

### Why this helps
No hard failure on screen; conversation still works.

## 7) Content Studio loading fallback
### Normal behavior
Generated projects load when opening Content Studio.

### If projects API fails
The screen still opens and shows an empty list instead of crashing the page.

### Why this helps
Users can still use other Content Studio features.

## 8) Image enrichment fallback (website generation)
### Normal behavior
The app enriches images before generating website config.

### If image enrichment fails
Generation still continues with available/default data.

### Why this helps
Website generation is not blocked by one failed step.

## 9) Rate limit fallback (development)
### Normal behavior
Backend limits request frequency to protect from abuse.

### Dev safety behavior
Limits are higher in development and selected delete endpoints are exempted.

### Why this helps
Developers are less likely to hit "Too Many Requests" while testing.

---

If users report "it failed", check:
1. Did fallback activate and keep the flow alive?
2. Did the user still reach the next step?
3. Is the error now only quality-related (not blocking)?

If yes, fallback worked as designed.
