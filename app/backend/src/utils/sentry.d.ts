import * as Sentry from '@sentry/node';
/**
 * Sentry error tracking initialization for Express backend
 */
export declare function initializeSentry(app: any): typeof Sentry | undefined;
/**
 * Attach error handler to Express
 */
export declare function attachSentryErrorHandler(app: any): void;
/**
 * Capture custom exceptions
 */
export declare function captureException(error: Error, context?: Record<string, any>): void;
/**
 * Capture custom messages
 */
export declare function captureMessage(message: string, level?: Sentry.SeverityLevel): void;
export default Sentry;
//# sourceMappingURL=sentry.d.ts.map