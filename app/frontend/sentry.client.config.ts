// Sentry client-side configuration for Next.js
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

Sentry.init({
  dsn: dsn || undefined,
  tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.0'),
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development',
  // Replay integration removed to match installed @sentry/nextjs typings
  // For session replay enablement, install and configure @sentry/replay separately if desired
  // replaysSessionSampleRate and replaysOnErrorSampleRate intentionally omitted for now
});

export default Sentry;
