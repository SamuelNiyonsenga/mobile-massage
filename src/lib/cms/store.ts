import { promises as fs } from 'fs';
import path from 'path';
import { DEFAULTS, DOCS, type DocKey } from './schemas';
import { sanitizeObject } from './types';

/**
 * File-based content store with a draft / published split and version history.
 * Everything goes through this module, so moving to a database later only means
 * replacing these functions.
 */

export const DATA_ROOT = process.env.CMS_DATA_DIR || path.join(process.cwd(), 'content');
export type Stage = 'draft' | 'published';

const HISTORY_LIMIT = 15;

const file = (stage: Stage, key: DocKey) => path.join(DATA_ROOT, stage, `${key}.json`);
const historyDir = (key: DocKey) => path.join(DATA_ROOT, 'history', key);

async function readJson(p: string): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(p, 'utf8'));
  } catch {
    return null;
  }
}

async function writeJson(p: string, data: unknown) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  const tmp = `${p}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, p);
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

/** Starter content fills any gap; stored values (including whole lists) win. */
function merge(base: unknown, over: unknown): unknown {
  if (over === undefined) return base;
  if (isObj(base) && isObj(over)) {
    const out: Record<string, unknown> = { ...base };
    for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
    return out;
  }
  return over;
}

export async function getDoc<T>(key: DocKey, stage: Stage = 'published'): Promise<T> {
  let stored = await readJson(file('published', key));
  if (stage === 'draft') {
    const draft = await readJson(file('draft', key));
    if (draft) stored = draft;
  }
  const merged = merge(DEFAULTS[key], stored ?? undefined);
  return sanitizeObject(DOCS[key].fields, merged) as T;
}

/** When the live version of a document was last published (ISO date), if ever. */
export async function publishedAt(key: DocKey): Promise<string | undefined> {
  try {
    return (await fs.stat(file('published', key))).mtime.toISOString();
  } catch {
    return undefined;
  }
}

export async function hasUnpublished(key: DocKey): Promise<boolean> {
  const draft = await readJson(file('draft', key));
  if (!draft) return false;
  const [d, p] = await Promise.all([getDoc(key, 'draft'), getDoc(key, 'published')]);
  return JSON.stringify(d) !== JSON.stringify(p);
}

export async function saveDraft(key: DocKey, raw: unknown) {
  const clean = sanitizeObject(DOCS[key].fields, raw);
  await writeJson(file('draft', key), clean);
  return clean;
}

export async function discardDraft(key: DocKey) {
  await fs.rm(file('draft', key), { force: true });
  return getDoc(key, 'published');
}

export async function publish(key: DocKey) {
  const data = await getDoc(key, 'draft');
  await writeJson(file('published', key), data);
  await writeJson(path.join(historyDir(key), `${Date.now()}.json`), data);
  await pruneHistory(key);
  await fs.rm(file('draft', key), { force: true });
  return data;
}

async function pruneHistory(key: DocKey) {
  const names = await listHistoryNames(key);
  for (const n of names.slice(HISTORY_LIMIT)) {
    await fs.rm(path.join(historyDir(key), `${n}.json`), { force: true });
  }
}

async function listHistoryNames(key: DocKey): Promise<string[]> {
  try {
    const files = await fs.readdir(historyDir(key));
    return files
      .filter((f) => /^\d+\.json$/.test(f))
      .map((f) => f.replace('.json', ''))
      .sort((a, b) => Number(b) - Number(a));
  } catch {
    return [];
  }
}

export async function listHistory(key: DocKey) {
  const names = await listHistoryNames(key);
  return names.map((id) => ({ id, at: new Date(Number(id)).toISOString() }));
}

export async function restoreVersion(key: DocKey, id: string) {
  if (!/^\d+$/.test(id)) return null;
  const data = await readJson(path.join(historyDir(key), `${id}.json`));
  if (!data) return null;
  return saveDraft(key, data);
}
