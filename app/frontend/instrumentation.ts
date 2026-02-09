// Next.js instrumentation file - auto-loaded by Next.js 13+
// Ensures Sentry is initialized before any user code runs

export async function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config');
    } else {
      await import('./sentry.client.config');
    }
  }
}
