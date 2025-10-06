import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('GitHub Actions Workflow Contract Validation', () => {
  let workflowContent: any;

  test.beforeAll(() => {
    const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');
    const fileContent = fs.readFileSync(workflowPath, 'utf-8');
    workflowContent = yaml.parse(fileContent);
  });

  test('workflow has correct name', () => {
    expect(workflowContent.name).toBe('CI/CD Pipeline');
  });

  test('workflow triggers only on push to main branch', () => {
    expect(workflowContent.on).toBeDefined();
    expect(workflowContent.on.push).toBeDefined();
    expect(workflowContent.on.push.branches).toContain('main');
    expect(workflowContent.on.push.branches).toHaveLength(1);
  });

  test('all 4 jobs exist', () => {
    expect(workflowContent.jobs).toBeDefined();
    expect(workflowContent.jobs.build).toBeDefined();
    expect(workflowContent.jobs['test-unit']).toBeDefined();
    expect(workflowContent.jobs['test-e2e']).toBeDefined();
    expect(workflowContent.jobs.summary).toBeDefined();
  });

  test('all jobs use ubuntu-latest runner', () => {
    expect(workflowContent.jobs.build['runs-on']).toBe('ubuntu-latest');
    expect(workflowContent.jobs['test-unit']['runs-on']).toBe('ubuntu-latest');
    expect(workflowContent.jobs['test-e2e']['runs-on']).toBe('ubuntu-latest');
    expect(workflowContent.jobs.summary['runs-on']).toBe('ubuntu-latest');
  });

  test('all jobs use Node.js version 22+', () => {
    const buildNodeStep = workflowContent.jobs.build.steps.find((step: any) => step.uses && step.uses.startsWith('actions/setup-node'));
    expect(buildNodeStep).toBeDefined();
    expect(buildNodeStep.with['node-version']).toBe('22');

    const unitTestNodeStep = workflowContent.jobs['test-unit'].steps.find((step: any) => step.uses && step.uses.startsWith('actions/setup-node'));
    expect(unitTestNodeStep).toBeDefined();
    expect(unitTestNodeStep.with['node-version']).toBe('22');

    const e2eTestNodeStep = workflowContent.jobs['test-e2e'].steps.find((step: any) => step.uses && step.uses.startsWith('actions/setup-node'));
    expect(e2eTestNodeStep).toBeDefined();
    expect(e2eTestNodeStep.with['node-version']).toBe('22');
  });

  test('build job has no dependencies', () => {
    expect(workflowContent.jobs.build.needs).toBeUndefined();
  });

  test('test-unit job depends on build', () => {
    expect(workflowContent.jobs['test-unit'].needs).toBe('build');
  });

  test('test-e2e job depends on build', () => {
    expect(workflowContent.jobs['test-e2e'].needs).toBe('build');
  });

  test('summary job depends on all jobs', () => {
    expect(workflowContent.jobs.summary.needs).toBeDefined();
    expect(workflowContent.jobs.summary.needs).toContain('build');
    expect(workflowContent.jobs.summary.needs).toContain('test-unit');
    expect(workflowContent.jobs.summary.needs).toContain('test-e2e');
    expect(workflowContent.jobs.summary.needs).toHaveLength(3);
  });

  test('summary job has if: always() condition', () => {
    expect(workflowContent.jobs.summary.if).toBe('always()');
  });

  test('all artifact uploads have retention-days: 3', () => {
    const buildArtifactStep = workflowContent.jobs.build.steps.find((step: any) => step.uses && step.uses.startsWith('actions/upload-artifact'));
    if (buildArtifactStep) {
      expect(buildArtifactStep.with['retention-days']).toBe(3);
    }

    const e2eArtifactStep = workflowContent.jobs['test-e2e'].steps.find((step: any) => step.uses && step.uses.startsWith('actions/upload-artifact'));
    if (e2eArtifactStep) {
      expect(e2eArtifactStep.with['retention-days']).toBe(3);
    }
  });
});
