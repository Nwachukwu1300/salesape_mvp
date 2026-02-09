// Sentry server-side configuration for Next.js
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || '';

Sentry.init({
  dsn: dsn || undefined,
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.0'),
  environment: process.env.NODE_ENV || 'development',
  // Using default handlers provided by Sentry; explicit integrations removed to match typings
});

export default Sentry;
