import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

const [report, label, summary] = process.argv.slice(2);
if (!report || !label || !summary) {
  throw new Error('Usage: summarize-junit.mjs REPORT LABEL SUMMARY');
}

const xml = readFileSync(report, 'utf8');
const suites = [...xml.matchAll(/<testsuite\b[^>]*>/g)].map(([tag]) => tag);
if (suites.length === 0) throw new Error(`No JUnit test suites in ${report}`);

function count(tag, attribute) {
  return Number(new RegExp(`\\b${attribute}="(\\d+)"`).exec(tag)?.[1] ?? 0);
}

const totals = suites.reduce((result, suite) => ({
  tests: result.tests + count(suite, 'tests'),
  failures: result.failures + count(suite, 'failures') + count(suite, 'errors'),
  skipped: result.skipped + count(suite, 'skipped'),
}), { tests: 0, failures: 0, skipped: 0 });
if (totals.tests === 0) throw new Error(`No JUnit test cases in ${report}`);

mkdirSync(dirname(summary), { recursive: true });
appendFileSync(summary, `\n## ${label}\n\n| Total | Passed | Failed | Skipped |\n|---:|---:|---:|---:|\n| ${totals.tests} | ${totals.tests - totals.failures - totals.skipped} | ${totals.failures} | ${totals.skipped} |\n`);
console.log(`${label}: ${totals.tests} tests, ${totals.failures} failed, ${totals.skipped} skipped`);
if (totals.failures > 0) process.exitCode = 1;
