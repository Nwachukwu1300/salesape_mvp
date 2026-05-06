#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const BACKEND_DIR = path.join(ROOT_DIR, 'app', 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'app', 'frontend');

console.log('SalesAPE local startup');
console.log('');
console.log('Steps:');
console.log('  1. Check backend env files');
console.log('  2. Start backend on port 3001');
console.log('  3. Start frontend on port 3002');
console.log('');

const backendEnv = ['.env.local', '.env'].find((file) =>
  fs.existsSync(path.join(BACKEND_DIR, file))
);

if (backendEnv) {
  console.log(`Backend env file found: app/backend/${backendEnv}`);
} else {
  console.log('Backend env file not found. Copy .env.example values into app/backend/.env or .env.local.');
}

console.log('Starting backend...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: BACKEND_DIR,
  stdio: 'inherit',
  shell: true,
});

let frontend;
setTimeout(() => {
  console.log('Starting frontend...');
  frontend = spawn('npm', ['run', 'dev'], {
    cwd: FRONTEND_DIR,
    stdio: 'inherit',
    shell: true,
  });

  frontend.on('error', (err) => {
    console.error('Frontend error:', err.message);
  });

  frontend.on('exit', (code) => {
    if (code !== 0) console.error(`Frontend exited with code ${code}`);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Backend error:', err.message);
});

backend.on('exit', (code) => {
  if (code !== 0) console.error(`Backend exited with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('');
  console.log('Shutting down services...');
  backend.kill();
  if (frontend) frontend.kill();
  setTimeout(() => process.exit(0), 1000);
});

console.log('');
console.log('Services starting. Press Ctrl+C to stop.');
