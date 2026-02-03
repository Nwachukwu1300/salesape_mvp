#!/bin/bash
cd "$(dirname "$0")/.."
npx tsx src/index.ts 2>&1 | tee server.log
