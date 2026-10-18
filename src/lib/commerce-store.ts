import "server-only";
import { getStore } from "@netlify/blobs";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

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

// A conditional lease prevents the callback and scheduled worker sending the same event concurrently.
export async function claimDeliveryLease(eventId: string) {
  const key = `leases/${eventId}`;
  const token = crypto.randomUUID();
  const lease = { token, expiresAt: Date.now() + 120000 };
  if (local) {
    const previous = await readRecord<{ expiresAt: number }>(key);
    if (previous && previous.expiresAt > Date.now()) return null;
    if (previous) await deleteRecord(key);
    return await writeRecord(key, lease, true) ? token : null;
  }
  const previous = await store().getWithMetadata(key, { type: "json" });
  if (previous && previous.data.expiresAt > Date.now()) return null;
  const result = await store().setJSON(key, lease, previous ? { onlyIfMatch: previous.etag } : { onlyIfNew: true });
  return result.modified ? token : null;
}

export async function releaseDeliveryLease(eventId: string, token: string) {
  const key = `leases/${eventId}`;
  if (local) {
    const previous = await readRecord<{ token: string }>(key);
    if (previous?.token === token) await deleteRecord(key);
    return;
  }
  const previous = await store().getWithMetadata(key, { type: "json" });
  if (previous?.data.token === token) {
    await store().setJSON(key, { token, expiresAt: 0 }, { onlyIfMatch: previous.etag });
  }
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
