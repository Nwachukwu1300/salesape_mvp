#!/usr/bin/env node
import { execSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('🔄 Regenerating Prisma client...');
  console.log('Working directory:', process.cwd());
  
  // Run prisma generate
  execSync('npx prisma generate', {
    cwd: __dirname,
    stdio: 'inherit',
  });
  
  console.log('✅ Prisma client regenerated successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to regenerate Prisma client:', error.message);
  process.exit(1);
}
