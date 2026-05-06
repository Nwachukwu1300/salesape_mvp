# Supabase storage bucket verification.
# Usage: .\verify-buckets.ps1

$ErrorActionPreference = "Stop"

Write-Host "SalesAPE storage bucket verification" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$envPath = "app/backend/.env"
if (-not (Test-Path $envPath)) {
    Write-Host "Backend .env file not found at $envPath" -ForegroundColor Red
    Write-Host "Copy relevant values from .env.example into app/backend/.env" -ForegroundColor Yellow
    exit 1
}

$envLines = Get-Content $envPath
$supabaseUrl = ($envLines | Select-String "^SUPABASE_URL=" | Select-Object -First 1).ToString().Split("=", 2)[1]
$supabaseKey = ($envLines | Select-String "^SUPABASE_SERVICE_KEY=" | Select-Object -First 1).ToString().Split("=", 2)[1]

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in app/backend/.env" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "app/backend/node_modules")) {
    Write-Host "Backend dependencies not installed" -ForegroundColor Red
    Write-Host "Run: npm --prefix app/backend install" -ForegroundColor Yellow
    exit 1
}

$testScript = @"
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const buckets = ['websites', 'videos', 'audio', 'generated-assets'];

const { data, error } = await supabase.storage.listBuckets();
if (error) {
  console.error('Could not connect to Supabase:', error.message);
  process.exit(1);
}

const existing = new Set(data.map((bucket) => bucket.name));
const missing = buckets.filter((name) => !existing.has(name));

if (missing.length) {
  console.error('Missing buckets:', missing.join(', '));
  console.error('See docs/OPERATIONS.md for bucket names and setup notes.');
  process.exit(1);
}

console.log('All required buckets exist:', buckets.join(', '));
"@

$tempScript = "temp-bucket-test.mjs"
$testScript | Out-File -FilePath $tempScript -Encoding UTF8

try {
    Push-Location app/backend
    $env:SUPABASE_URL = $supabaseUrl
    $env:SUPABASE_SERVICE_KEY = $supabaseKey
    node ../../$tempScript
    $testResult = $LASTEXITCODE
} finally {
    Pop-Location
    Remove-Item $tempScript -ErrorAction SilentlyContinue
}

exit $testResult
