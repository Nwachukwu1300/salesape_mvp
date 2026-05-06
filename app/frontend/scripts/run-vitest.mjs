import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const tempDir = path.join(process.cwd(), '.tmp', 'vitest');
mkdirSync(tempDir, { recursive: true });

const vitestBin = path.join(process.cwd(), 'node_modules', 'vitest', 'vitest.mjs');
const child = spawn(process.execPath, [vitestBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    TEMP: tempDir,
    TMP: tempDir,
    TMPDIR: tempDir,
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
