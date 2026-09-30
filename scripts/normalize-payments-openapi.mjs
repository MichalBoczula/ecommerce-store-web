import { readFileSync, writeFileSync } from 'node:fs';

const source = JSON.parse(readFileSync(process.argv[2], 'utf8'));

function normalize(node) {
  if (Array.isArray(node)) {
    node.forEach(normalize);
    return;
  }
  if (!node || typeof node !== 'object') return;

  // Kiota 1.34.1 TypeScript cannot resolve a return model containing a
  // Pydantic 3.1 anyOf [T, null]. Its nullable form is equivalent here.
  if (Array.isArray(node.anyOf) && node.anyOf.length === 2 &&
      node.anyOf.some(option => option.type === 'null')) {
    const nonNull = node.anyOf.find(option => option.type !== 'null');
    delete node.anyOf;
    Object.assign(node, nonNull, { nullable: true });
  }
  Object.values(node).forEach(normalize);
}

normalize(source);
writeFileSync(process.argv[3], JSON.stringify(source));
