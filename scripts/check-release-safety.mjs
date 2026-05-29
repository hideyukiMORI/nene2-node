#!/usr/bin/env node
/**
 * Release-safety audit (ADR 0003 / Phase 9 A3).
 *
 *   node scripts/check-release-safety.mjs
 *
 * Fails (exit 1) when a `vX.Y.Z` tag exists on origin with **no matching GitHub
 * Release** — the drift that stranded v0.1.24 / v0.1.25 (hand-tagged, never
 * published). Tags are only created by a GitHub Release in the supported flow
 * (`scripts/publish-release.mjs`), so a tag without a release means someone
 * hand-tagged. See docs/development/release-process.md.
 *
 * Requires network + an authenticated `gh`. Not part of `npm run check`; run it
 * before a release and in a dedicated CI job.
 */
import { execSync } from 'node:child_process';

/**
 * Documented historical orphans: hand-cut before the release rule existed and
 * intentionally never published (npm jumped 0.1.23 → 0.1.26). New drift beyond
 * these must fail.
 */
const ALLOWED_TAGS_WITHOUT_RELEASE = new Set(['v0.1.24', 'v0.1.25']);

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

let remoteTagsRaw;
let releasesRaw;
try {
  remoteTagsRaw = sh("git ls-remote --tags origin 'v*.*.*'");
  releasesRaw = sh('gh release list --limit 500 --json tagName --jq ".[].tagName"');
} catch (error) {
  console.error(`✖ release-safety: could not query origin / gh (${error.message})`);
  process.exit(1);
}

const tags = new Set(
  remoteTagsRaw
    .split('\n')
    .map((line) => line.split('\t')[1] ?? '')
    .filter((ref) => ref.startsWith('refs/tags/') && !ref.endsWith('^{}'))
    .map((ref) => ref.slice('refs/tags/'.length))
    .filter((t) => /^v\d+\.\d+\.\d+$/.test(t)),
);
const releases = new Set(releasesRaw === '' ? [] : releasesRaw.split('\n'));

const orphans = [...tags]
  .filter((tag) => !releases.has(tag) && !ALLOWED_TAGS_WITHOUT_RELEASE.has(tag))
  .sort();

if (orphans.length > 0) {
  console.error(`✖ release-safety: ${orphans.length} tag(s) without a GitHub Release:`);
  for (const t of orphans)
    console.error(`  - ${t}  (hand-tagged? publish via the release flow, not git tag)`);
  process.exit(1);
}

console.log(
  `✓ release-safety: ${tags.size} version tag(s), all released ` +
    `(allowed orphans: ${[...ALLOWED_TAGS_WITHOUT_RELEASE].join(', ')})`,
);
