import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { EXTENSION_BY_TYPE } from "./upload-rules";

// Vercel Blob when BLOB_READ_WRITE_TOKEN is set, otherwise public/uploads for local dev.
export async function storeImage(file: File): Promise<string> {
  const name = `${randomUUID()}.${EXTENSION_BY_TYPE[file.type]}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${name}`, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
