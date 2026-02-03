#!/usr/bin/env node
const url = 'http://localhost:3001/health';
const timeoutMs = 5000;

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

(async () => {
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    console.log('HEALTH_OK', text);
    process.exit(0);
  } catch (err) {
    console.error('HEALTH_CHECK_FAILED', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    clearTimeout(timeout);
  }
})();
