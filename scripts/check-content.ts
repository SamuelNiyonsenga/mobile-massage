/**
 * Guards against the bug where starter content and the CMS schema drift apart:
 * every default must survive sanitising unchanged, and every schema field must exist in the defaults.
 * Run with: npm run check:content
 */
import { DEFAULTS, DOCS, type DocKey } from '../src/lib/cms/schemas';
import { sanitizeObject, type Field } from '../src/lib/cms/types';

let failures = 0;

/** JSON with sorted keys, so the order fields are written in does not matter. */
function canon(v: unknown): string {
  return JSON.stringify(v, (_k, val) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.fromEntries(Object.entries(val as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : val,
  );
}

function walkFields(fields: Field[], value: unknown, where: string) {
  const obj = (value && typeof value === 'object' && !Array.isArray(value) ? value : {}) as Record<string, unknown>;
  for (const f of fields) {
    const here = `${where}.${f.name}`;
    if (!(f.name in obj)) {
      console.error(`MISSING  ${here} is in the schema but not in the starter content`);
      failures++;
      continue;
    }
    const v = obj[f.name];
    if (f.type === 'group') walkFields(f.fields ?? [], v, here);
    if (f.type === 'list') {
      if (!Array.isArray(v)) {
        console.error(`SHAPE    ${here} should be a list`);
        failures++;
      } else v.forEach((item, i) => walkFields(f.fields ?? [], item, `${here}[${i}]`));
    }
    if (f.type === 'stringList' && !Array.isArray(v)) {
      console.error(`SHAPE    ${here} should be a list of text`);
      failures++;
    }
  }
}

for (const key of Object.keys(DOCS) as DocKey[]) {
  const def = DOCS[key];
  const defaults = DEFAULTS[key];
  walkFields(def.fields, defaults, key);
  const cleaned = sanitizeObject(def.fields, defaults);
  if (canon(cleaned) !== canon(defaults)) {
    console.error(`CHANGED  ${key}: sanitising the starter content alters it (shape or value mismatch)`);
    failures++;
  }
}

if (failures) {
  console.error(`\n${failures} problem(s) found.`);
  process.exit(1);
}
console.log('Starter content matches the schema.');
