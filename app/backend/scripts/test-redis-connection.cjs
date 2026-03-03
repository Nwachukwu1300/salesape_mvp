const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const Redis = require('ioredis');

const host = process.env.REDIS_HOST;
const port = parseInt(process.env.REDIS_PORT || '6379');
const password = process.env.REDIS_PASSWORD;
const url = process.env.REDIS_URL;

async function tryConnect(opts, label) {
  console.log(`\nTrying ${label}...`);
  const client = new Redis(opts);
  try {
    const res = await Promise.race([
      client.ping(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('ping timeout')), 5000)),
    ]);
    console.log(`${label} ping response:`, res);
  } catch (err) {
    console.error(`${label} error:`, err && err.message ? err.message : err);
  } finally {
    try {
      await client.quit();
    } catch (_) {}
  }
}

(async () => {
  if (url) {
    // try the URL as-is
    await tryConnect(url, `URL (${url.startsWith('rediss') ? 'TLS' : 'plain'})`);
  }

  // Try explicit TLS options
  await tryConnect({ host, port, password, tls: { servername: host } }, 'TLS (opts)');

  // Try plaintext
  await tryConnect({ host, port, password }, 'Plain TCP (opts)');

  process.exit(0);
})();
