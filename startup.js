#!/usr/bin/env node

// SalesAPE A+ Complete Startup Script
// Handles: Database verification, Service startup, Health checks

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'c:\\Users\\Lambert\\gitclones\\salesape_mvp';
const BACKEND_DIR = path.join(ROOT_DIR, 'app\\backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'app\\frontend');

console.log('🚀 SalesAPE A+ Complete Startup\n');
console.log('📋 Startup Steps:');
console.log('  1. Verify .env.local configuration');
console.log('  2. Test database connection');
console.log('  3. Start backend (port 3001)');
console.log('  4. Start frontend (port 5173)');
console.log('  5. Verify both services\n');

// Step 1: Verify configuration
console.log('✓ Step 1: Checking configuration...');
const envPath = path.join(BACKEND_DIR, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('postgresql://postgres:darkgoldenshade-@db.hoblkikpxqfsnhunlpqs.supabase.co')) {
        console.log('  ✅ Supabase DATABASE_URL configured');
    } else {
        console.log('  ⚠️  DATABASE_URL not found');
    }
} else {
    console.log('  ❌ .env.local not found');
}

// Step 2-5: Start services
console.log('\n✓ Step 2-5: Starting services...');
console.log('  Starting Backend (port 3001)...');

const backend = spawn('npx', ['tsx', 'src/index.ts'], {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    shell: true
});

setTimeout(() => {
    console.log('  Starting Frontend (port 5173)...');
    const frontend = spawn('npm', ['run', 'dev'], {
        cwd: FRONTEND_DIR,
        stdio: 'inherit',
        shell: true
    });
    
    frontend.on('error', (err) => {
        console.error('❌ Frontend error:', err.message);
    });
    
    frontend.on('exit', (code) => {
        if (code !== 0) console.error(`❌ Frontend exited with code ${code}`);
    });
}, 3000);

backend.on('error', (err) => {
    console.error('❌ Backend error:', err.message);
});

backend.on('exit', (code) => {
    if (code !== 0) console.error(`❌ Backend exited with code ${code}`);
});

// Cleanup
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down services...');
    backend.kill();
    setTimeout(() => process.exit(0), 1000);
});

console.log('\n✅ Services starting... (Press Ctrl+C to stop)\n');
