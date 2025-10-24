export const runtime = "nodejs";

import { readFile, stat } from "node:fs/promises";
import { join, normalize } from "node:path";
import { lookup as mimeLookup } from "mime-types";

export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } },
) {
  try {
    const baseDir = process.env.UPLOAD_DIR || "./uploads";
    const safeRel = normalize("/" + (params.path ?? []).join("/")).replace(
      /^\/+/,
      "",
    );
    const abs = join(baseDir, safeRel);

    const st = await stat(abs);
    if (!st.isFile()) return new Response("not a file", { status: 404 });

    const buf = await readFile(abs);
    const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    const mime = String(mimeLookup(abs) || "application/octet-stream");

    return new Response(bytes as unknown as BodyInit, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(bytes.byteLength),
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
