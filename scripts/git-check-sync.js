#!/usr/bin/env node
/* eslint-env node */

import { execSync } from 'child_process';

try {
  const uncommittedChanges = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();

  if (uncommittedChanges) {
    console.error('Error: Uncommitted changes detected. Commit or stash before release.');
    console.error('\nFiles with changes:');
    console.error(uncommittedChanges);
    process.exit(1);
  }

  try {
    const unpushedCommits = execSync('git rev-list @{u}..HEAD', { encoding: 'utf-8' }).trim();

    if (unpushedCommits) {
      console.error('Error: Unpushed commits detected. Push changes before release.');
      process.exit(1);
    }
  } catch (upstreamError) {
    if (upstreamError.message.includes('no upstream')) {
      console.error('Error: No upstream branch configured. Push branch to remote first.');
      process.exit(1);
    }
    throw upstreamError;
  }

  process.exit(0);
} catch (error) {
  console.error('Error checking git sync:', error.message);
  process.exit(1);
}
