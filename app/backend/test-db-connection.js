#!/usr/bin/env node
/**
 * Test Supabase PostgreSQL Connection
 * Verifies database is accessible before running migrations
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\n' + '='.repeat(60));
console.log('🔍 Testing Supabase Database Connection');
console.log('='.repeat(60) + '\n');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
    console.error('❌ ERROR: .env.local not found');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const dbUrl = envContent.match(/DATABASE_URL="([^"]+)"/)?.[1];

if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL not found in .env.local');
    process.exit(1);
}

console.log('✅ Database URL found');
console.log(`   Host: ${new URL(dbUrl).hostname}`);
console.log(`   Database: ${new URL(dbUrl).pathname.slice(1)}`);

// Test connection with Prisma
console.log('\n⏳ Testing Prisma connection...');

const testScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    const result = await prisma.$queryRaw\`SELECT 1\`;
    console.log('✅ Database connection successful!');
    
    // Count existing tables
    const tables = await prisma.$queryRaw\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    \`;
    
    console.log(\`📊 Found \${tables.length} tables in database\`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
`;

// Write temp test file
const tempTestFile = path.join(__dirname, '.test-db-connection.js');
fs.writeFileSync(tempTestFile, testScript);

// Execute the test
const proc = exec('node ' + tempTestFile, { cwd: __dirname }, (err, stdout, stderr) => {
    // Clean up temp file
    fs.unlinkSync(tempTestFile);
    
    if (err) {
        if (stderr.includes('ECONNREFUSED')) {
            console.error('❌ ERROR: Cannot reach Supabase');
            console.error('   Ensure your database is accessible and internet connection is active');
        } else {
            console.error('❌ ERROR:', stderr);
        }
        process.exit(1);
    }
    
    console.log(stdout);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database Connection Test Complete!');
    console.log('='.repeat(60) + '\n');
    console.log('Next steps:');
    console.log('  1. Run migrations: npx prisma db push');
    console.log('  2. Start backend: npm run dev');
    console.log('\n');
    
    process.exit(0);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.error('\n❌ ERROR: Connection test timed out (10s)');
    console.error('   Check your internet connection and Supabase status');
    try { fs.unlinkSync(tempTestFile); } catch {}
    process.exit(1);
}, 10000);
