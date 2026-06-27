import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const artifactsDir = path.join(rootDir, 'artifacts', 'hero-qa');
const staticFile = path.join(artifactsDir, 'static-results.json');
const playwrightFile = path.join(artifactsDir, 'playwright-results.json');
const qaRunFile = path.join(artifactsDir, 'qa-run.json');

async function readJsonIfExists(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function collectTests(suiteNode, collector) {
  if (!suiteNode || typeof suiteNode !== 'object') return;
  const specs = Array.isArray(suiteNode.specs) ? suiteNode.specs : [];
  for (const spec of specs) {
    const tests = Array.isArray(spec.tests) ? spec.tests : [];
    for (const test of tests) {
      const title = String(test.title || spec.title || '');
      const results = Array.isArray(test.results) ? test.results : [];
      const latestResult = results[results.length - 1];
      const status = latestResult?.status || test.status || 'unknown';
      collector.push({ title, status });
    }
  }
  const suites = Array.isArray(suiteNode.suites) ? suiteNode.suites : [];
  for (const child of suites) collectTests(child, collector);
}

function summarizeMatrix(tests, prefix) {
  const scoped = tests.filter((test) => test.title.startsWith(prefix));
  const passed = scoped.filter((test) => test.status === 'passed').length;
  const skipped = scoped.filter((test) => test.status === 'skipped').length;
  const failed = scoped.filter((test) => !['passed', 'skipped'].includes(test.status)).length;
  return { total: scoped.length, passed, failed, skipped };
}

const staticResults = await readJsonIfExists(staticFile);
const playwrightResults = await readJsonIfExists(playwrightFile);
const qaRun = await readJsonIfExists(qaRunFile);

const tests = [];
if (playwrightResults) {
  const rootSuites = Array.isArray(playwrightResults.suites) ? playwrightResults.suites : [];
  for (const suite of rootSuites) collectTests(suite, tests);
}

const modeMatrix = summarizeMatrix(tests, '[mode]');
const sourceMatrix = summarizeMatrix(tests, '[source]');
const fallbackMatrix = summarizeMatrix(tests, '[fallback]');
const sanityMatrix = summarizeMatrix(tests, '[sanity]');

const manualRequired = [
  {
    id: 'source-library-seeded',
    reason: 'Library source selection is automated only when deterministic seeded assets are guaranteed in target environment.',
  },
  {
    id: 'source-upload-fixture',
    reason: 'Upload source test depends on storage credentials/policies and fixture management; keep as manual by default.',
  },
];

const warnings = [];
if (staticResults?.checks?.find((item) => item.name === 'build' && item.passed)) {
  warnings.push('next-intl webpack cache parsing warnings may appear during build; classified as non-blocking if build passes.');
}

const totalFailedTests = tests.filter((test) => !['passed', 'skipped'].includes(test.status)).length;
const totalSkippedTests = tests.filter((test) => test.status === 'skipped').length;
const overallPassed = Boolean(staticResults && !staticResults.hasFailures && qaRun?.e2e?.passed === true && totalFailedTests === 0);

const summary = {
  generatedAt: new Date().toISOString(),
  overallPassed,
  staticChecks: staticResults?.checks ?? [],
  e2e: {
    exitCode: qaRun?.e2e?.exitCode ?? null,
    passed: qaRun?.e2e?.passed ?? false,
    totalTests: tests.length,
    skippedTests: totalSkippedTests,
    failedTests: totalFailedTests,
  },
  matrices: {
    modeMatrix,
    sourceMatrix,
    fallbackMatrix,
    localeViewportSanity: sanityMatrix,
  },
  warnings,
  manualRequired,
  artifactPaths: {
    screenshots: 'artifacts/hero-qa/test-results',
    playwrightJson: 'artifacts/hero-qa/playwright-results.json',
    logs: 'artifacts/hero-qa/logs',
  },
};

await mkdir(artifactsDir, { recursive: true });
await writeFile(path.join(artifactsDir, 'results.json'), JSON.stringify(summary, null, 2), 'utf8');

const staticLines = (summary.staticChecks || [])
  .map((check) => `- ${check.name}: ${check.passed ? 'PASS' : 'FAIL'} (\`${check.command}\`)`)
  .join('\n');

const manualLines = manualRequired.map((item) => `- [ ] ${item.id}: ${item.reason}`).join('\n');
const warningLines = warnings.length > 0 ? warnings.map((item) => `- ${item}`).join('\n') : '- none';

const markdown = `# Hero QA Summary

- Generated at: ${summary.generatedAt}
- Overall: **${summary.overallPassed ? 'PASS' : 'FAIL'}**

## Static checks
${staticLines || '- no data'}

## Matrix status
- Mode matrix: ${modeMatrix.passed}/${modeMatrix.total} passed
- Source matrix (automated subset): ${sourceMatrix.passed}/${sourceMatrix.total} passed
- Fallback matrix: ${fallbackMatrix.passed}/${fallbackMatrix.total} passed
- Locale/viewport sanity: ${sanityMatrix.passed}/${sanityMatrix.total} passed
- E2E skipped: ${totalSkippedTests}

## Non-blocking warnings
${warningLines}

## Manual-required items
${manualLines}

## Artifacts
- Screenshots: \`artifacts/hero-qa/test-results\`
- Playwright JSON: \`artifacts/hero-qa/playwright-results.json\`
- Command logs: \`artifacts/hero-qa/logs\`
`;

await writeFile(path.join(artifactsDir, 'summary.md'), markdown, 'utf8');

