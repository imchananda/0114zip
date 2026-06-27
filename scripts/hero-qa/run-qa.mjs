import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const artifactsDir = path.join(rootDir, 'artifacts', 'hero-qa');

async function runStep(name, command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      shell: true,
      cwd: rootDir,
      env: process.env,
      stdio: 'inherit',
    });
    child.on('close', (code) => {
      resolve({
        name,
        command: `${command} ${args.join(' ')}`.trim(),
        exitCode: code ?? 1,
        passed: code === 0,
      });
    });
  });
}

function collectStatuses(suiteNode, collector) {
  if (!suiteNode || typeof suiteNode !== 'object') return;
  const specs = Array.isArray(suiteNode.specs) ? suiteNode.specs : [];
  for (const spec of specs) {
    const tests = Array.isArray(spec.tests) ? spec.tests : [];
    for (const test of tests) {
      const results = Array.isArray(test.results) ? test.results : [];
      const latest = results[results.length - 1];
      collector.push(latest?.status || test.status || 'unknown');
    }
  }
  const suites = Array.isArray(suiteNode.suites) ? suiteNode.suites : [];
  for (const child of suites) collectStatuses(child, collector);
}

async function detectSkippedOnlyRun() {
  try {
    const raw = await readFile(path.join(artifactsDir, 'playwright-results.json'), 'utf8');
    const json = JSON.parse(raw);
    const statuses = [];
    const suites = Array.isArray(json.suites) ? json.suites : [];
    for (const suite of suites) collectStatuses(suite, statuses);
    if (statuses.length === 0) return { skippedOnly: false, total: 0 };
    const skipped = statuses.filter((status) => status === 'skipped').length;
    return { skippedOnly: skipped === statuses.length, total: statuses.length };
  } catch {
    return { skippedOnly: false, total: 0 };
  }
}

await mkdir(artifactsDir, { recursive: true });

const staticStep = await runStep('static', 'npm', ['run', 'qa:hero:static']);
let e2eStep = {
  name: 'e2e',
  command: 'npm run qa:hero:e2e',
  exitCode: null,
  passed: false,
  skipped: false,
};

if (staticStep.passed) {
  e2eStep = await runStep('e2e', 'npm', ['run', 'qa:hero:e2e']);
  if (e2eStep.passed) {
    const skippedCheck = await detectSkippedOnlyRun();
    if (skippedCheck.skippedOnly && skippedCheck.total > 0) {
      e2eStep = {
        ...e2eStep,
        passed: false,
        exitCode: 2,
        reason: 'All E2E tests were skipped (usually missing HERO_QA_ADMIN_EMAIL/HERO_QA_ADMIN_PASSWORD).',
      };
    }
  }
} else {
  e2eStep.skipped = true;
}

const qaRun = {
  generatedAt: new Date().toISOString(),
  static: staticStep,
  e2e: e2eStep,
};
await writeFile(path.join(artifactsDir, 'qa-run.json'), JSON.stringify(qaRun, null, 2), 'utf8');

const reportStep = await runStep('report', 'npm', ['run', 'qa:hero:report']);
if (!reportStep.passed) {
  process.exit(1);
}

process.exit(staticStep.passed && e2eStep.passed ? 0 : 1);
