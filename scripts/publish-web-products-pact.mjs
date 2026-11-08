import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [directory, receipt] = process.argv.slice(2);
if (!directory || !receipt) {
  throw new Error('Provide the verified Pact artifact directory and receipt path.');
}

const { GITHUB_EVENT_NAME, GITHUB_REF, GITHUB_SHA, GITHUB_RUN_ID } = process.env;
if (GITHUB_EVENT_NAME !== 'push' || GITHUB_REF !== 'refs/heads/master') {
  throw new Error('Web Pact publication requires a master push.');
}
if (!/^[a-f0-9]{40}$/.test(GITHUB_SHA ?? '') || !/^\d+$/.test(GITHUB_RUN_ID ?? '')) {
  throw new Error('Web Pact publication requires GitHub commit and run metadata.');
}

const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
const content = await readFile(join(directory, 'web-products.json'));
const pact = JSON.parse(content.toString('utf8'));
const sha256 = createHash('sha256').update(content).digest('hex');
if (
  manifest.schemaVersion !== 1 || manifest.file !== 'web-products.json' ||
  manifest.consumer !== 'web' || manifest.provider !== 'products' ||
  pact.consumer?.name !== 'web' || pact.provider?.name !== 'products' ||
  manifest.pactSpecification !== '4.0' || pact.metadata?.pactSpecification?.version !== '4.0' ||
  manifest.sha256 !== sha256 || manifest.interactionCount !== 2 || pact.interactions?.length !== 2
) {
  throw new Error('The verified Web Products Pact differs from its manifest.');
}

const origin = URL.parse(process.env.PACT_REGISTRY_URL ?? '');
const token = process.env.PACT_PUBLISHER_TOKEN;
if (
  !origin || origin.protocol !== 'https:' || origin.username || origin.password ||
  origin.pathname !== '/' || origin.search || origin.hash || !token
) {
  throw new Error('Configure an HTTPS registry origin and a Web-scoped publisher token.');
}

async function post(path, body) {
  const response = await fetch(new URL(path, origin), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(90000),
  });
  if (!response.ok) {
    throw new Error(`Pact registry rejected ${path} with HTTP ${response.status}.`);
  }
  return response.json();
}

const repositoryUrl = 'https://github.com/MichalBoczula/ecommerce-store-web';
const buildUrl = `${repositoryUrl}/actions/runs/${GITHUB_RUN_ID}`;
await post('/api/applications/web/versions', { commitSha: GITHUB_SHA, repositoryUrl });
await post('/api/integrations', { consumerApplicationId: 'web', providerApplicationId: 'products' });
const publication = await post('/api/contract-publications', {
  sourceApplicationId: 'web',
  commitSha: GITHUB_SHA,
  kind: 'ConsumerPact',
  consumerApplicationId: 'web',
  providerApplicationId: 'products',
  sourceRef: GITHUB_REF,
  buildUrl,
  contentBase64: content.toString('base64'),
});
if (publication.artifactSha256 !== sha256 || !publication.id) {
  throw new Error('The registry did not return the expected Web Products Pact publication.');
}

await writeFile(receipt, JSON.stringify({
  publicationId: publication.id, commitSha: GITHUB_SHA, sha256, buildUrl,
}, null, 2) + '\n');
console.log(`Published Web Products Pact ${sha256} as ${publication.id}.`);
