import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { generateSeoFiles, getSiteUrl } from './generate-seo.mjs';

const siteUrl = getSiteUrl();
await generateSeoFiles(siteUrl);

const env = {
  ...process.env,
  VITE_SITE_URL: process.env.VITE_SITE_URL || siteUrl,
};

function run(scriptPath, args) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(path.join(process.cwd(), 'node_modules', 'typescript', 'bin', 'tsc'), ['-b']);
run(path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js'), ['build']);
