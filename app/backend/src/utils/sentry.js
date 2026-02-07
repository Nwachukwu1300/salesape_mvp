import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
/**
 * Sentry error tracking initialization for Express backend
 */
export function initializeSentry(app) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (!process.env.SENTRY_DSN) {
        console.warn('⚠️  SENTRY_DSN not configured. Error tracking disabled.');
        return;
    }
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            new ProfilingIntegration(),
            new Sentry.Integrations.Http({ tracing: true }),
            new Sentry.Integrations.Express({ app, request: true, serverName: true }),
            new Sentry.Integrations.OnUncaughtException(),
            new Sentry.Integrations.OnUnhandledRejection({ mode: 'strict' }),
        ],
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: isDevelopment ? 1.0 : 0.1,
        profilesSampleRate: 0.1,
        debug: isDevelopment,
        includeErrorCodeContext: true,
        attachStacktrace: true,
        serverName: 'salesape-backend',
        release: process.env.GIT_COMMIT || 'unknown',
    });
    // Attach Sentry request handler to Express
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    return Sentry;
}
/**
 * Attach error handler to Express
 */
export function attachSentryErrorHandler(app) {
    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());
}
/**
 * Capture custom exceptions
 */
export function captureException(error, context = {}) {
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, {
            contexts: { custom: context },
        });
    }
    else {
        console.error('Exception:', error, context);
    }
}
/**
 * Capture custom messages
 */
export function captureMessage(message, level = 'info') {
    if (process.env.SENTRY_DSN) {
        Sentry.captureMessage(message, level);
    }
    else {
        console.log(`[${level}] ${message}`);
    }
}
export default Sentry;
//# sourceMappingURL=sentry.js.map