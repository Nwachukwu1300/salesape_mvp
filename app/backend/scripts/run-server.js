const { spawn } = require('child_process');
const path = require('path');

const backendDir = path.resolve(__dirname, '..');
console.log('Starting detached server from', backendDir);

// Use shell so npx resolves correctly on Windows
const child = spawn('npx tsx src/index.ts', { cwd: backendDir, detached: true, stdio: 'ignore', shell: true });
child.unref();
console.log('Started server (detached) with pid', child.pid);
