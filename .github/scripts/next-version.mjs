// Decides the next @digiup/native-base version for the commit that just landed on main.
//
// The bump comes from the merged pull request:
//   label  `major`, `minor`, `patch` or `no release`  wins, otherwise
//   title  `feat!:` / `fix!:` / "BREAKING CHANGE"      → major
//          `feat:` / `feat(scope):`                    → minor
//          anything else                               → patch
// A manual run passes LEVEL instead. Writes `level` and `version` to $GITHUB_OUTPUT; no version means skip.

import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';

const PACKAGE = 'packages/ui/package.json';
const LEVELS = ['major', 'minor', 'patch'];

function levelFrom(text, labels = []) {
  const names = labels.map((label) => label.name.toLowerCase());
  if (names.includes('no release')) return 'none';
  const labelled = LEVELS.find((level) => names.includes(level));
  if (labelled) return labelled;
  if (/^\w+(\([^)]*\))?!:/.test(text) || /BREAKING CHANGE/.test(text)) return 'major';
  if (/^feat(\([^)]*\))?:/i.test(text)) return 'minor';
  return 'patch';
}

async function mergedPullRequest() {
  const { GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_TOKEN } = process.env;
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}/pulls`, {
    headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${GITHUB_TOKEN}` },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  return (await res.json()).find((pr) => pr.merged_at);
}

const parse = (version) => version.split('-')[0].split('.').map(Number);
const newer = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i] ? a : b;
  return a;
};

function bump(version, level) {
  const [major, minor, patch] = parse(version);
  if (level === 'major') return `${major + 1}.0.0`;
  if (level === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/** The registry may be ahead of package.json if a past run published but could not push its commit. */
function published(name) {
  try {
    return execFileSync('npm', ['view', name, 'version'], { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

let level = process.env.LEVEL;
let reason = 'manual run';
if (!level) {
  const pr = await mergedPullRequest();
  const message = execFileSync('git', ['log', '-1', '--format=%B'], { encoding: 'utf8' });
  level = pr ? levelFrom(pr.title, pr.labels) : levelFrom(message);
  reason = pr ? `#${pr.number} ${pr.title}` : 'direct push';
}
if (![...LEVELS, 'none'].includes(level)) throw new Error(`Unknown release level "${level}"`);

const pkg = JSON.parse(readFileSync(PACKAGE, 'utf8'));
const current = newer(pkg.version, published(pkg.name) ?? pkg.version);
const version = level === 'none' ? '' : bump(current, level);

console.log(version ? `${reason}: ${level} ${current} → ${version}` : `${reason}: no release`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `level=${level}\nversion=${version}\n`);
