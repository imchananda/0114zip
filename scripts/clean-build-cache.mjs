import { rmSync } from 'node:fs';

const paths = ['.next', 'node_modules/.cache', '.turbo'];
for (const p of paths) {
  rmSync(p, { recursive: true, force: true });
}
console.log('Removed build caches:', paths.join(', '));
