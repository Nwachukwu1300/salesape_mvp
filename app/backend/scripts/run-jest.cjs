const fs = require('fs');
const path = require('path');

const tempDir = path.resolve(__dirname, '..', '.jest-tmp');
fs.mkdirSync(tempDir, { recursive: true });

process.env.TEMP = tempDir;
process.env.TMP = tempDir;
process.env.TMPDIR = tempDir;

require('../node_modules/jest/bin/jest');
