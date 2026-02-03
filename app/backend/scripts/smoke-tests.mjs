import axios from 'axios';

const BASE = 'http://localhost:3001';

async function run() {
  try {
    console.log('1) Health check...');
    const h = await axios.get(`${BASE}/health`);
    console.log('  health:', h.data);

    console.log('2) Register test user...');
    const email = `dev+test+${Date.now()}@example.com`;
    const register = await axios.post(`${BASE}/auth/register`, { email, password: 'Test1234!', name: 'Dev Tester' });
    console.log('  registered:', register.data.user?.id || register.data.user || 'ok');

    console.log('3) Login...');
    const login = await axios.post(`${BASE}/auth/login`, { email, password: 'Test1234!' });
    const token = login.data.token;
    if (!token) throw new Error('No token from login');
    console.log('  token received');

    const auth = { headers: { Authorization: `Bearer ${token}` } };

    console.log('4) Create business (minimal)...');
    const create = await axios.post(`${BASE}/businesses`, { url: 'https://example.com', name: 'Smoke Biz', description: 'Test business' }, auth);
    console.log('  created business id:', create.data.id || create.data);

    console.log('5) List businesses...');
    const list = await axios.get(`${BASE}/businesses`, auth);
    console.log('  businesses count:', Array.isArray(list.data) ? list.data.length : 'unknown');

    console.log('Smoke tests completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err && err.response ? err.response.data || err.response.statusText : err.message || err);
    process.exit(2);
  }
}

run();
