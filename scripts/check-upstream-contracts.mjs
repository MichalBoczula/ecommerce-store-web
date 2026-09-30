import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('contracts/upstream/manifest.json', 'utf8'));

for (const name of ['products', 'users', 'invoice', 'payments']) {
  const expected = manifest[name]?.specSha256;
  if (typeof expected !== 'string' || !/^[a-f0-9]{64}$/.test(expected)) {
    throw new Error(`Missing SHA-256 for ${name} in upstream manifest`);
  }

  const actual = createHash('sha256')
    .update(readFileSync(`contracts/upstream/${name}.openapi.json`))
    .digest('hex');

  if (actual !== expected) {
    throw new Error(`${name} OpenAPI differs from the pinned upstream manifest`);
  }
}

console.log('Pinned upstream OpenAPI checksums match the manifest.');
