#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'app', 'backend');
const frontendDir = path.join(rootDir, 'app', 'frontend');
const envCandidates = ['.env.local', '.env'];

console.log('');
console.log('SalesAPE setup verification');
console.log('='.repeat(40));

console.log('');
console.log('Environment');
const foundEnv = envCandidates.find((file) => fs.existsSync(path.join(backendDir, file)));
if (foundEnv) {
  const content = fs.readFileSync(path.join(backendDir, foundEnv), 'utf-8');
  console.log(`  ok backend ${foundEnv} found`);
  console.log(content.includes('DATABASE_URL=') ? '  ok DATABASE_URL present' : '  missing DATABASE_URL');
  console.log(content.includes('JWT_SECRET=') ? '  ok JWT_SECRET present' : '  missing JWT_SECRET');
} else {
  console.log('  missing backend env file');
}

console.log('');
console.log('Backend files');
[
  'src/index.ts',
  'src/routes',
  'src/services',
  'src/queues',
  'src/workers',
  'prisma/schema.prisma',
].forEach((file) => {
  const target = path.join(backendDir, file);
  console.log(fs.existsSync(target) ? `  ok ${file}` : `  missing ${file}`);
});

console.log('');
console.log('Frontend files');
[
  'src/main.tsx',
  'src/routes.tsx',
  'src/screens',
  'src/components',
  'vite.config.ts',
].forEach((file) => {
  const target = path.join(frontendDir, file);
  console.log(fs.existsSync(target) ? `  ok ${file}` : `  missing ${file}`);
});

console.log('');
console.log('Next steps');
console.log('  npm run install:all');
console.log('  npm run prisma:generate');
console.log('  npm run dev:backend');
console.log('  npm run dev:frontend');
console.log('  backend:  http://localhost:3001');
console.log('  frontend: http://localhost:3002');
console.log('');
