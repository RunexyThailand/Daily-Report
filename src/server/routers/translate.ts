import { z } from "zod";
import { router, publicProcedure } from "../trpc";
type TranslateFormat = "text" | "html";

// คุณมี Lang อยู่แล้วในโปรเจกต์
// type Lang = "en" | "ja" | "th" | ...;

interface TranslateRequest {
  q: string; // หรือ string[] ถ้าจะส่งหลายข้อความ
  target: Lang;
  source?: string; // ถ้ารู้แน่ (ห้าม "und")
  format?: TranslateFormat; // ปกติ title=text, description=html
}

type Lang = "en" | "ja" | "th";
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY!;
const BASE_TRANSLATE =
  "https://translation.googleapis.com/language/translate/v2";

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function Detect(text: string) {
  const res = await fetch(`${BASE_TRANSLATE}/detect?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text }),
  }).then((r) => r.json());

  // รูปแบบ response:
  // data.detections = [[{ language: "en", confidence: 0.8, isReliable: false }]]
  const det = res?.data?.detections?.[0]?.[0];
  const lang: string = det?.language?.toLowerCase?.() ?? "und";
  const confidence: number | null = det?.confidence ?? null;
  return { languageCode: lang, confidence };
}

async function TranslateOne(params: {
  q: string;
  target: Lang;
  source?: string;
  format?: "text" | "html";
}) {
  const { q, target, source, format = "text" } = params;
  const payload: TranslateRequest = { q, target, format };
  if (source && source !== "und") payload.source = source;

  const res = await fetch(`${BASE_TRANSLATE}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

  return res?.data?.translations?.[0]?.translatedText ?? q;
}

export const translateRouter = router({
  detect: publicProcedure
    .input(z.object({ title: z.string(), description: z.string() }))
    .query(async ({ input }) => {
      const contentForDetect = `${input.title}\n${stripHtml(input.description)}`;
      return await Detect(contentForDetect);
    }),

  translateExceptSource: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        targets: z
          .array(z.enum(["ja", "th", "en"]))
          .default(["ja", "th", "en"]),
      }),
    )
    .mutation(async ({ input }) => {
      if (!API_KEY) throw new Error("Missing GOOGLE_TRANSLATE_API_KEY");

      const forDetect = `${input.title}\n${stripHtml(input.description)}`;
      const det = await Detect(forDetect);
      const sourceLang = det.languageCode as Lang | "und";

      const finalTargets = input.targets.filter(
        (t) => t !== sourceLang,
      ) as Lang[];

      const translations: Partial<
        Record<Lang, { title: string; description: string }>
      > = {};
      for (const target of finalTargets) {
        const [titleTranslated, descTranslated] = await Promise.all([
          TranslateOne({
            q: input.title,
            target,
            source: sourceLang,
            format: "text",
          }),
          TranslateOne({
            q: input.description,
            target,
            source: sourceLang,
            format: "html",
          }),
        ]);
        translations[target] = {
          title: titleTranslated,
          description: descTranslated,
        };
      }

      return {
        source: det, // { languageCode, confidence }
        original: { title: input.title, description: input.description },
        translations, // ไม่มี key ของภาษาต้นฉบับ
      };
    }),
});
