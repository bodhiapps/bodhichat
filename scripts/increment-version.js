#!/usr/bin/env node
/* eslint-env node */

const versionArg = process.argv[2];

if (!versionArg) {
  console.error('Usage: node increment-version.js <version>');
  console.error('Example: node increment-version.js 1.2.3');
  process.exit(1);
}

const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/;
const match = versionArg.match(versionRegex);

if (!match) {
  console.error(`Error: Invalid version format "${versionArg}". Expected format: MAJOR.MINOR.PATCH (e.g., 1.2.3)`);
  process.exit(1);
}

const [, major, minor, patch] = match;
const nextPatch = parseInt(patch, 10) + 1;
const nextVersion = `${major}.${minor}.${nextPatch}`;

console.log(nextVersion);
process.exit(0);
