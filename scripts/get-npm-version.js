#!/usr/bin/env node
/* eslint-env node */

import { execSync } from 'child_process';

const packageName = process.argv[2];

if (!packageName) {
  console.error('Usage: node get-npm-version.js <package-name>');
  process.exit(1);
}

try {
  const version = execSync(`npm view ${packageName} version`, { encoding: 'utf-8' }).trim();
  console.log(version);
  process.exit(0);
} catch (error) {
  console.error(`Error fetching version for ${packageName}:`, error.message);
  process.exit(1);
}
