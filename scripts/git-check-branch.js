#!/usr/bin/env node
/* eslint-env node */

import { execSync } from 'child_process';

try {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();

  if (currentBranch !== 'main') {
    console.error(`Error: Must be on main branch (currently on ${currentBranch})`);
    process.exit(1);
  }

  process.exit(0);
} catch (error) {
  console.error('Error checking git branch:', error.message);
  process.exit(1);
}
