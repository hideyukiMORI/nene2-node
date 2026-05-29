#!/usr/bin/env node
/**
 * Doc-integrity guard (ADR 0003 / roadmap Phase 9 A2). No dependencies.
 *
 * Fails (exit 1) when:
 *   1. a field-trial report is not listed in INDEX.md, or row count != file count;
 *   2. a "current release" string drifts from package.json version;
 *   3. a relative intra-repo Markdown link does not resolve.
 *
 * Sibling-repo / external links (resolving outside the repo root) and http(s)/
 * mailto/anchor links are intentionally skipped.
 *
 * Run: npm run docs:check
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';

const root = process.cwd();
const problems = [];
const read = (p) => readFileSync(join(root, p), 'utf8');

// --- 1. Field-trial INDEX integrity ------------------------------------------
const ftDir = 'docs/field-trials';
const reports = readdirSync(join(root, ftDir)).filter((f) =>
  /^2026-05-field-trial-\d+.*\.md$/.test(f),
);
const indexSrc = read(`${ftDir}/INDEX.md`);
for (const f of reports) {
  if (!indexSrc.includes(f)) problems.push(`INDEX.md does not list ${f}`);
}
const rowCount = (indexSrc.match(/^\|\s*\d+\s*\|/gm) ?? []).length;
if (rowCount !== reports.length) {
  problems.push(`INDEX.md FT rows (${rowCount}) != report files (${reports.length})`);
}

// --- 2. Current-release consistency ------------------------------------------
const version = JSON.parse(read('package.json')).version;
const versionRefs = [
  ['README.md', /Latest \(npm\):\s*\[v([\d.]+)\]/],
  ['docs/roadmap.md', /\*\*Current release:\*\*\s*\[v([\d.]+)\]/],
  ['docs/milestones/2026-05-master-plan.md', /\*\*Current release:\*\*\s*\[v([\d.]+)\]/],
  ['docs/publish-checklist.md', /\*\*Latest:\*\*\s*`([\d.]+)`/],
  ['docs/todo/current.md', /\*\*npm latest:\*\*\s*\[v([\d.]+)\]/],
];
for (const [file, re] of versionRefs) {
  if (!existsSync(join(root, file))) continue;
  const m = re.exec(read(file));
  if (m && m[1] !== version) {
    problems.push(`${file}: current-release v${m[1]} != package.json ${version}`);
  }
}

// --- 3. Broken intra-repo Markdown links -------------------------------------
function collectMarkdown(dir, acc) {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const rel = join(dir, entry.name);
    if (entry.isDirectory()) collectMarkdown(rel, acc);
    else if (entry.name.endsWith('.md')) acc.push(rel);
  }
  return acc;
}
const mdFiles = ['README.md', 'CLAUDE.md', 'AGENTS.md', 'CHANGELOG.md'].filter((f) =>
  existsSync(join(root, f)),
);
collectMarkdown('docs', mdFiles);

const linkRe = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
for (const file of mdFiles) {
  // strip fenced code blocks to avoid sample-code false positives
  const src = read(file).replace(/```[\s\S]*?```/g, '');
  let m;
  while ((m = linkRe.exec(src)) !== null) {
    const raw = m[1].trim();
    if (/^(https?:|mailto:|#|tel:)/.test(raw)) continue;
    const target = raw.split('#')[0];
    if (target === '') continue;
    const resolved = resolve(root, dirname(file), target);
    // skip links that escape the repo (sibling repos, external checkouts)
    if (relative(root, resolved).startsWith('..')) continue;
    if (!existsSync(resolved)) problems.push(`${file}: broken link → ${raw}`);
  }
}

// --- report -------------------------------------------------------------------
if (problems.length > 0) {
  console.error(`✖ doc-integrity: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(
  `✓ doc-integrity: ${reports.length} FT reports indexed, version ${version} consistent, links OK`,
);
