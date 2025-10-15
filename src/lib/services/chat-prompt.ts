type CanonicalLang = "th" | "ja" | "zh-CN" | "zh-TW";

function normalizeTargetLang(
  targetLang: string,
  opts?: { chineseVariant?: "simplified" | "traditional" },
): { code: CanonicalLang; label: string } {
  const t = (targetLang || "").trim().toLowerCase();

  // Thai
  if (["th", "thai"].includes(t)) return { code: "th", label: "Thai (th)" };

  // Japanese
  if (["ja", "jp", "jpn", "japanese"].includes(t))
    return { code: "ja", label: "Japanese (ja)" };

  // Chinese variants & aliases
  if (
    [
      "zh",
      "cn",
      "ch",
      "zho",
      "chi",
      "chinese",
      "zh-cn",
      "zh-sg",
      "zh-hans",
      "zh-tw",
      "zh-hk",
      "zh-mo",
      "zh-hant",
      "zh_trad",
      "zh_simp",
    ].includes(t)
  ) {
    const variant =
      opts?.chineseVariant ??
      (["zh-tw", "zh-hk", "zh-mo", "zh-hant"].includes(t)
        ? "traditional"
        : "simplified");

    if (variant === "traditional") {
      return { code: "zh-TW", label: "Chinese (Traditional, zh-TW)" };
    }
    return { code: "zh-CN", label: "Chinese (Simplified, zh-CN)" };
  }

  return { code: "ja", label: "Japanese (ja)" };
}

export function buildTranslatePrompt(
  input: string,
  targetLang: string,
  opts?: { chineseVariant?: "simplified" | "traditional" },
) {
  const { code, label } = normalizeTargetLang(targetLang, opts);
  const TEXT_JSON = JSON.stringify(input);

  return `You are a professional translator.
      Goal: Translate the given content into ${label} and return only the translated result as a single string — no explanations, no JSON, no quotes, no markdown fences.
      STRICT HTML ECHO CONTRACT — read carefully:
      - If input contains any "<" and ">" (HTML present), you MUST return **the exact same HTML** with only human-readable text nodes translated to ${label}.
      - Preserve every tag, every attribute, order, nesting (even if invalid), comments, whitespace, entities, and capitalization **exactly**.
      - Do NOT add, remove, reorder, wrap, unwrap, pretty-print, or minify anything.
      - Do NOT modify attributes or their values (title, alt, aria-*, placeholder, value, class, id, data-*, href, src, etc.).
      - Do NOT change entities like &nbsp; &amp; &lt; &gt; — keep exactly as written.
      - Do NOT normalize or fix malformed HTML; keep duplicates like "<p><p>...</p></p>" exactly as-is.

      Safety rules:
      - Do NOT translate contents inside <code>, <pre>, <kbd>, <samp>, <var>, <script>, <style>.
      - Do NOT translate filenames, URLs, IDs, classes, query strings, or template placeholders: {{name}}, \${var}, <%= ... %>, :attribute, {{ t("...") }}.
      - Keep emoji/symbols unchanged.

      Validation you MUST satisfy before replying:
      1) If input contains HTML, the count of "<" in your output MUST equal the count of "<" in the input; same for ">".
      2) All occurrences of "<p>" and "</p>" in the input MUST appear in exactly the same positions/order in the output.
      3) Output MUST start and end with the same first and last non-whitespace characters as the input.
      4) If you cannot preserve the exact HTML for any reason, return the input **unchanged**.

      Non-HTML case:
      - If input is plain text (no tags), return only the ${label} translation (single string), preserving original line breaks.

      Few-shot examples (follow exactly):

      Example A (nested <p> must be preserved):
      Input:
      <p><p>นี่คือภาพรวม</p><h1>คุณสมบัติ</h1><p>นี่คือภาพรวม</p></p>
      Output:
      <p><p>${code === "ja" ? "これは概要です" : code === "th" ? "นี่คือภาพรวม" : code === "zh-TW" ? "這是概要" : "这是概要"}</p><h1>${code === "ja" ? "機能" : code === "th" ? "คุณสมบัติ" : code === "zh-TW" ? "功能" : "功能"}</h1><p>${code === "ja" ? "これは概要です" : code === "th" ? "นี่คือภาพรวม" : code === "zh-TW" ? "這是概要" : "这是概要"}</p></p>

      Example B (attributes untouched, only text nodes translated):
      Input:
      <div class="card" data-x="1"><h2 title="keep">สวัสดี</h2><p>คำอธิบาย</p></div>
      Output:
      <div class="card" data-x="1"><h2 title="keep">${code === "ja" ? "こんにちは" : code === "th" ? "สวัสดี" : code === "zh-TW" ? "你好" : "你好"}</h2><p>${code === "ja" ? "説明" : code === "th" ? "คำอธิบาย" : code === "zh-TW" ? "說明" : "说明"}</p></div>

      Now translate the following input according to the rules and validations. Return ONLY the translated result (no extra characters):

      ${TEXT_JSON}
      `.trim();
}

export function buildTranslatePromptText(
  input: string,
  targetLang: string,
  opts?: { chineseVariant?: "simplified" | "traditional" },
) {
  const { code, label } = normalizeTargetLang(targetLang, opts);
  const TEXT_JSON = JSON.stringify(input);

  return `Translate the following text into ${label}.
    Return only the translated text — no explanations, no JSON, no quotes, no markdown.

    Input:
    ${TEXT_JSON}
    Output:
    (only the translated ${label} text)
    `;
}
