// app/uploads/[...path]/route.ts
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

    const buf = await readFile(abs); // Node Buffer (extends Uint8Array)
    const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    const mime = String(mimeLookup(abs) || "application/octet-stream");

    // ✅ ใช้ Uint8Array เป็น BodyInit (ถ้า lib DOM ถูกต้องจะพาส์อัตโนมัติ)
    // ถ้ายังฟ้องในโปรเจกต์คุณ ให้เติม "as unknown as BodyInit" ไว้ชั่วคราว
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
