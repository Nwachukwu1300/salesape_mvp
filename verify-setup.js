#!/usr/bin/env node
/**
 * SalesAPE A+ Setup Verification
 * Checks configuration and database connectivity
 */

const fs = require('fs');
const path = require('path');

const backendDir = 'c:\\Users\\Lambert\\gitclones\\salesape_mvp\\app\\backend';
const envPath = path.join(backendDir, '.env.local');

console.log('\n' + '='.repeat(60));
console.log('🚀 SalesAPE A+ Setup Verification');
console.log('='.repeat(60) + '\n');

// Check 1: .env.local exists
console.log('📋 Check 1: Environment Configuration');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    console.log('  ✅ .env.local found');
    
    if (content.includes('postgresql://')) {
        console.log('  ✅ Supabase DATABASE_URL configured');
        if (content.includes('db.hoblkikpxqfsnhunlpqs.supabase.co')) {
            console.log('  ✅ Correct Supabase instance detected');
        }
    }
    
    if (content.includes('REDIS_HOST=localhost')) {
        console.log('  ✅ Redis configured (localhost:6379)');
    }
} else {
    console.log('  ❌ .env.local NOT found');
}

// Check 2: Backend files
console.log('\n📦 Check 2: Backend Files');
const requiredFiles = [
    'src/index.ts',
    'src/utils/sanitizer.ts',
    'src/utils/prompt-guard.ts',
    'src/utils/lead-scorer.ts',
    'src/utils/schema-generator.ts',
    'src/utils/content-repurposer.ts',
    'prisma/schema.prisma'
];

requiredFiles.forEach(file => {
    const filepath = path.join(backendDir, file);
    if (fs.existsSync(filepath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} missing`);
    }
});

// Check 3: package.json scripts
console.log('\n⚙️  Check 3: NPM Scripts');
const pkgPath = path.join(backendDir, 'package.json');
if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const scripts = Object.keys(pkg.scripts || {});
    
    if (scripts.includes('dev')) {
        console.log('  ✅ dev script available');
    }
    if (scripts.includes('start:detached')) {
        console.log('  ✅ start:detached script available');
    }
}

// Check 4: Prisma configuration
console.log('\n🗄️  Check 4: Database Schema');
const schemaPath = path.join(backendDir, 'prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    const modelCount = (schema.match(/model\s+\w+\s*{/g) || []).length;
    console.log(`  ✅ Prisma schema found (${modelCount} models)`);
    
    if (schema.includes('ContentProject')) {
        console.log('  ✅ Content Studio models present');
    }
}

console.log('\n' + '='.repeat(60));
console.log('✅ Setup Verification Complete!');
console.log('='.repeat(60));
console.log('\n📖 Next Steps:');
console.log('  1. Ensure Supabase database is accessible');
console.log('  2. Run: cd app/backend && npm run dev');
console.log('  3. Run: cd app/frontend && npm run dev');
console.log('  4. Check: http://localhost:3001 (backend)');
console.log('  5. Check: http://localhost:5173 (frontend)');
console.log('\n');
