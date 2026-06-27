import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const artifactsDir = path.join(rootDir, 'artifacts', 'hero-qa');
const logsDir = path.join(artifactsDir, 'logs');
const outputFile = path.join(artifactsDir, 'static-results.json');

async function runCommand(name, command, args) {
  await mkdir(logsDir, { recursive: true });
  const logPath = path.join(logsDir, `${name}.log`);
  let output = '';

  return new Promise((resolve) => {
    const child = spawn(command, args, { shell: true, cwd: rootDir, env: process.env });
    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });
    child.on('close', async (code) => {
      await writeFile(logPath, output, 'utf8');
      resolve({
        name,
        command: `${command} ${args.join(' ')}`.trim(),
        exitCode: code ?? 1,
        passed: code === 0,
        logPath: path.relative(rootDir, logPath).replaceAll('\\', '/'),
      });
    });
  });
}

const checks = [];
checks.push(await runCommand('tsc', 'npx', ['tsc', '--noEmit']));
checks.push(await runCommand('lint', 'npm', ['run', 'lint']));
checks.push(await runCommand('build', 'npm', ['run', 'build']));

const hasFailures = checks.some((check) => !check.passed);

await writeFile(
  outputFile,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      checks,
      hasFailures,
    },
    null,
    2,
  ),
  'utf8',
);

process.exit(hasFailures ? 1 : 0);
