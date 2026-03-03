const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const backendDir = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 3001);
console.log('Starting detached server from', backendDir, 'on port', port);

function getPortOwnerPid(portToCheck) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
          // Fallback lookup via netstat (Windows)
          const { exec } = require('child_process');
          exec(`netstat -ano | findstr :${portToCheck}`, (execErr, stdout) => {
            if (execErr || !stdout) return resolve(null);
            const lines = stdout
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean)
              .filter((l) => l.includes('LISTENING'));
            for (const line of lines) {
              const parts = line.split(/\s+/);
              const pid = Number(parts[parts.length - 1]);
              if (Number.isInteger(pid) && pid > 0) return resolve(pid);
            }
            resolve(null);
          });
        } else {
          resolve(null);
        }
      })
      .once('listening', () => {
        tester.once('close', () => resolve(null)).close();
      })
      .listen(portToCheck, '0.0.0.0');
  });
}

async function start() {
  const ownerPid = await getPortOwnerPid(port);
  if (ownerPid) {
    try {
      process.kill(ownerPid, 'SIGTERM');
      console.log(`Stopped existing process on port ${port} (PID ${ownerPid}).`);
      await new Promise((resolve) => setTimeout(resolve, 700));
    } catch (err) {
      console.error(`Failed to stop existing process on port ${port} (PID ${ownerPid}).`);
      throw err;
    }
  }

  const tsxCli = path.resolve(backendDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const useLocalTsx = fs.existsSync(tsxCli);

  const cmd = useLocalTsx ? process.execPath : 'npx';
  const args = useLocalTsx ? [tsxCli, 'src/index.ts'] : ['tsx', 'src/index.ts'];

  const child = spawn(cmd, args, {
    cwd: backendDir,
    detached: true,
    stdio: 'ignore',
    shell: !useLocalTsx,
  });
  child.unref();
  console.log('Started server (detached) with pid', child.pid);
}

start().catch((err) => {
  console.error('Failed to start detached server:', err && err.message ? err.message : String(err));
  process.exit(1);
});
