export function stripCodeFences(s: string) {
  const m = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(s);
  return (m ? m[1] : s).trim();
}
export function safeParseLLMJson(s: string) {
  const raw = stripCodeFences(s)
    .replace(/^\uFEFF/, "")
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]");
  return JSON.parse(raw);
}
