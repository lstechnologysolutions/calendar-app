const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
const versionMarker = `Latest Changes (v${packageJson.version})`;
const changelogMarker = `## [${packageJson.version}]`;
const alternateChangelogMarker = `## ${packageJson.version}`;

if (!readme.includes(versionMarker)) {
  console.error(`README.md is missing the release marker: ${versionMarker}`);
  process.exit(1);
}

if (!changelog.includes(changelogMarker) && !changelog.includes(alternateChangelogMarker)) {
  console.error(`CHANGELOG.md is missing an entry for version ${packageJson.version}`);
  process.exit(1);
}

console.log(`README and CHANGELOG are aligned for v${packageJson.version}.`);
