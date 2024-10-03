import { execSync } from 'child_process';

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const workspacesResult = execSync('npm query .workspace', {
  encoding: 'UTF-8',
});
const workspaces = JSON.parse(workspacesResult);

for await (let workspace of workspaces) {
  const src = resolve(workspace.location, 'dist');
  const name = workspace.location.replace('src/', '');
  const dist = resolve(__dirname, '../dist/kata', name);
  await fs.promises.cp(src, dist, { recursive: true });
  console.log('copy workspace', name);
}
