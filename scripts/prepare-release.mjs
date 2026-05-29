#!/usr/bin/env node
/**
 * Prepare a release (ADR 0003 / Phase 9 E9). No dependencies, no git side effects.
 *
 *   node scripts/prepare-release.mjs [--dry-run] <version>
 *
 * - Validates <version> (semver `X.Y.Z`, different from the current version).
 * - Rolls CHANGELOG: the `[Unreleased]` body becomes `[<version>] - <today>`,
 *   and a fresh empty `[Unreleased]` is inserted above it. Refuses when
 *   `[Unreleased]` has no real entries (nothing to release).
 * - Sets `package.json` `version` to <version>.
 *
 * Leaves the edits uncommitted for a normal review PR. After merge, publish with
 * `npm run release:publish`. See docs/development/release-process.md.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const version = args.find((a) => !a.startsWith('-'));

function fail(message) {
  console.error(`✖ prepare-release: ${message}`);
  process.exit(1);
}

if (version === undefined) fail('usage: prepare-release [--dry-run] <version>');
if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`invalid version "${version}" (expected X.Y.Z)`);

const pkgPath = 'package.json';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
if (pkg.version === version) fail(`package.json is already ${version}`);

const changelogPath = 'CHANGELOG.md';
const changelog = readFileSync(changelogPath, 'utf8');

const unreleasedHeader = '## [Unreleased]';
const start = changelog.indexOf(unreleasedHeader);
if (start === -1) fail('no "## [Unreleased]" section in CHANGELOG.md');

const afterHeader = start + unreleasedHeader.length;
const nextSection = changelog.indexOf('\n## ', afterHeader);
const bodyEnd = nextSection === -1 ? changelog.length : nextSection;
const body = changelog.slice(afterHeader, bodyEnd).trim();

if (body === '' || body === '_No changes yet._') {
  fail('[Unreleased] has no entries — nothing to release');
}

const today = new Date().toISOString().slice(0, 10);
const rolled =
  `${unreleasedHeader}\n\n_No changes yet._\n\n` + `## [${version}] - ${today}\n\n${body}\n`;
const newChangelog =
  changelog.slice(0, start) + rolled + changelog.slice(bodyEnd).replace(/^\n+/, '\n');

console.log(`prepare-release: ${pkg.version} → ${version} (${today})`);
console.log(`  CHANGELOG: roll [Unreleased] (${body.split('\n').length} lines) → [${version}]`);

if (dryRun) {
  console.log('  --dry-run: no files written');
  process.exit(0);
}

pkg.version = version;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
writeFileSync(changelogPath, newChangelog);
console.log('  wrote package.json + CHANGELOG.md');
console.log(
  'Next: review the diff → run `npm run check` → PR → merge → `npm run release:publish`.',
);
