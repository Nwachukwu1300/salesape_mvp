import * as Sentry from '@sentry/node';

/**
 * Sentry error tracking initialization for Express backend
 */
export function initializeSentry(app: any) {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️  SENTRY_DSN not configured. Error tracking disabled.');
    return;
  }

  // Initialize Sentry with minimal, compatible options for v10+.
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,
    debug: isDevelopment,
    attachStacktrace: true,
    serverName: 'salesape-backend',
    release: process.env.GIT_COMMIT || 'unknown',
  });

  // Attach Sentry request/tracing handlers (use `any` to avoid typing issues across Sentry versions)
  app.use((Sentry as any).Handlers?.requestHandler ? (Sentry as any).Handlers.requestHandler() : (_req: any, _res: any, next: any) => next());
  app.use((Sentry as any).Handlers?.tracingHandler ? (Sentry as any).Handlers.tracingHandler() : (_req: any, _res: any, next: any) => next());

  return Sentry;
}

/**
 * Attach error handler to Express
 */
export function attachSentryErrorHandler(app: any) {
  // The error handler must be before any other error middleware and after all controllers
  app.use((Sentry as any).Handlers?.errorHandler ? (Sentry as any).Handlers.errorHandler() : (_err: any, _req: any, _res: any, next: any) => next());
}

/**
 * Capture custom exceptions
 */
export function captureException(error: Error, context: Record<string, any> = {}) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: { custom: context },
    });
  } else {
    console.error('Exception:', error, context);
  }
}

/**
 * Capture custom messages
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level}] ${message}`);
  }
}

export default Sentry;
