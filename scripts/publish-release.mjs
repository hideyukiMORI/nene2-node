#!/usr/bin/env node
/**
 * Publish the release for the current package.json version (ADR 0003 / Phase 9 E9).
 *
 *   node scripts/publish-release.mjs [--dry-run]
 *
 * Verifies preconditions, then creates the GitHub Release `vX.Y.Z` — which is
 * what triggers the OIDC npm publish (`release.yml`). Never hand-tags.
 *
 * Preconditions (fail-closed):
 *   - on `main`, working tree clean, in sync with `origin/main`;
 *   - tag `vX.Y.Z` does not already exist (local or remote);
 *   - CHANGELOG has a `## [X.Y.Z]` section (notes are extracted from it).
 *
 * `--dry-run` runs every check and prints the `gh release create` command
 * without executing it. See docs/development/release-process.md.
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const dryRun = process.argv.includes('--dry-run');

function fail(message) {
  console.error(`✖ publish-release: ${message}`);
  process.exit(1);
}
function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const tag = `v${version}`;

// 1. branch / cleanliness / sync
const branch = sh('git rev-parse --abbrev-ref HEAD');
if (branch !== 'main') fail(`must release from main (on ${branch})`);
if (sh('git status --porcelain') !== '') fail('working tree is not clean');
sh('git fetch origin main --quiet');
const local = sh('git rev-parse @');
const remote = sh('git rev-parse @{u}');
if (local !== remote) fail('local main is not in sync with origin/main');

// 2. tag must not exist
if (sh(`git tag -l ${tag}`) !== '') fail(`tag ${tag} already exists locally`);
if (sh(`git ls-remote --tags origin ${tag}`) !== '') fail(`tag ${tag} already exists on origin`);

// 3. CHANGELOG section + notes
const changelog = readFileSync('CHANGELOG.md', 'utf8');
const header = `## [${version}]`;
const start = changelog.indexOf(header);
if (start === -1) fail(`CHANGELOG.md has no "${header}" section`);
const afterHeader = changelog.indexOf('\n', start) + 1;
const nextSection = changelog.indexOf('\n## ', afterHeader);
const notes = changelog.slice(afterHeader, nextSection === -1 ? undefined : nextSection).trim();
if (notes === '') fail(`CHANGELOG section ${header} is empty`);

console.log(`publish-release: ${tag}`);
console.log(`  preconditions OK (main, clean, in sync, ${tag} unused, CHANGELOG section found)`);

if (dryRun) {
  console.log('  --dry-run: would run:');
  console.log(
    `    gh release create ${tag} --target main --title "${tag}" --notes "<CHANGELOG [${version}]>"`,
  );
  process.exit(0);
}

execSync(`gh release create ${tag} --target main --title ${tag} --notes-file -`, {
  input: notes,
  stdio: ['pipe', 'inherit', 'inherit'],
});
console.log(`  created GitHub Release ${tag} → OIDC publish workflow triggered.`);
console.log(
  'Verify: `npm view @hideyukimori/nene2-framework version` and the release workflow run.',
);
