#!/usr/bin/env node
/* eslint-env node */

import { execSync } from 'child_process';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const tagName = process.argv[2];

if (!tagName) {
  console.error('Usage: node delete-tag-if-exists.js <tag-name>');
  process.exit(1);
}

async function promptUser(question) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim().toLowerCase();
}

async function checkAndDeleteTag() {
  try {
    let localExists = false;
    let remoteExists = false;

    try {
      const localCheck = execSync(`git tag -l "${tagName}"`, { encoding: 'utf-8' }).trim();
      localExists = localCheck.length > 0;
    } catch {
      localExists = false;
    }

    try {
      const remoteCheck = execSync(`git ls-remote --tags origin "${tagName}"`, { encoding: 'utf-8' }).trim();
      remoteExists = remoteCheck.length > 0;
    } catch {
      remoteExists = false;
    }

    if (!localExists && !remoteExists) {
      console.log(`Tag ${tagName} does not exist. Proceeding with tag creation.`);
      process.exit(0);
    }

    const locationStr = `(local: ${localExists ? 'yes' : 'no'}, remote: ${remoteExists ? 'yes' : 'no'})`;
    console.log(`Tag ${tagName} already exists ${locationStr}.`);

    const answer = await promptUser('Delete and recreate? This will trigger a new deployment. (y/N): ');

    if (answer === 'y' || answer === 'yes') {
      if (localExists) {
        console.log(`Deleting local tag ${tagName}...`);
        execSync(`git tag -d "${tagName}"`);
      }

      if (remoteExists) {
        console.log(`Deleting remote tag ${tagName}...`);
        execSync(`git push origin :refs/tags/"${tagName}"`);
      }

      console.log('Tags deleted successfully.');
      process.exit(0);
    } else {
      console.log('Deployment aborted. Tag not modified.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error checking/deleting tag:', error.message);
    process.exit(1);
  }
}

checkAndDeleteTag();
