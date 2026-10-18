import "server-only";
import { getStore } from "@netlify/blobs";
import { promises as fs } from "node:fs";
import path from "node:path";

// Local development never writes to the live site's customer records.
const local = process.env.NODE_ENV !== "production" && !process.env.NETLIFY;
const root = path.join(process.cwd(), ".local-commerce");

function store() {
  return getStore({
    name: `commerce-${process.env.CONTEXT || "production"}`,
    consistency: "strong",
    // Commerce reads must bypass Next's data cache (it also uses Blobs on Netlify).
    fetch: (url, options) => fetch(url, { ...options, cache: "no-store", signal: AbortSignal.timeout(8000) }),
  });
}

function file(key: string) {
  if (!/^[a-zA-Z0-9_/-]+$/.test(key)) throw new Error("Invalid storage key");
  return path.join(root, `${key}.json`);
}

export async function readRecord<T>(key: string): Promise<T | null> {
  if (!local) return store().get(key, { type: "json" });
  try {
    return JSON.parse(await fs.readFile(file(key), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function writeRecord(
  key: string,
  data: unknown,
  onlyIfNew = false,
) {
  if (!local)
    return (
      await store().setJSON(
        key,
        data,
        onlyIfNew ? { onlyIfNew: true } : undefined,
      )
    ).modified;
  const target = file(key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  try {
    await fs.writeFile(target, JSON.stringify(data), {
      flag: onlyIfNew ? "wx" : "w",
      mode: 0o600,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
    throw error;
  }
  return true;
}

export async function deleteRecord(key: string) {
  if (!local) return store().delete(key);
  await fs.rm(file(key), { force: true });
}

export async function listRecords(prefix: string, limit = 25) {
  if (!local) {
    const keys: string[] = [];
    for await (const page of store().list({ prefix, paginate: true })) {
      keys.push(...page.blobs.map((blob) => blob.key));
      if (keys.length >= limit) break;
    }
    return keys.slice(0, limit);
  }
  try {
    return (await fs.readdir(path.join(root, prefix)))
      .filter((name) => name.endsWith(".json"))
      .slice(0, limit)
      .map((name) => `${prefix}${name.slice(0, -5)}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function nextBatch(prefix: string) {
  const keys = (await listRecords(prefix, 5000)).sort();
  const cursor = await readRecord<{ key: string }>(
    `cursors/${prefix.replace("/", "")}`,
  );
  const after = cursor ? keys.filter((key) => key > cursor.key) : keys;
  const batch = (after.length ? after : keys).slice(0, 4);
  if (batch.length)
    await writeRecord(`cursors/${prefix.replace("/", "")}`, {
      key: batch[batch.length - 1],
    });
  return batch;
}
