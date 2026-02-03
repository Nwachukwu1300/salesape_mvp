const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const backendDir = path.resolve(__dirname, '..');

// Start server
console.log('[Launcher] Starting backend server from', backendDir);
const server = spawn('npx', ['tsx', 'src/index.ts'], {
  cwd: backendDir,
  detached: false,
  stdio: 'pipe',
  shell: true,
  env: process.env
});

let serverReady = false;
let lines = [];

server.stdout.on('data', (data) => {
  const msg = data.toString();
  lines.push(msg);
  console.log('[Server stdout]', msg.trim());
  if (msg.includes('[Server]') && msg.includes('ready')) {
    serverReady = true;
  }
});

server.stderr.on('data', (data) => {
  console.error('[Server stderr]', data.toString().trim());
});

// Wait for server to be ready, then run test
setTimeout(() => {
  if (!serverReady) {
    console.log('[Launcher] Server not ready yet, attempting test anyway...');
  }
  
  console.log('\n[Launcher] Running register test...');
  const testData = JSON.stringify({
    email: `dev+test+${Date.now()}@example.com`,
    password: 'Test1234!',
    name: 'Dev Tester'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('\n[Test] Status:', res.statusCode);
      console.log('[Test] Response:', body);
      
      server.kill();
      process.exit(res.statusCode === 201 ? 0 : 1);
    });
  });

  req.on('error', (e) => {
    console.error('\n[Test] Request error:', e.message);
    server.kill();
    process.exit(1);
  });

  req.write(testData);
  req.end();
}, 3000);
