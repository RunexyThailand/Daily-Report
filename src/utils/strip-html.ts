// utility: strip HTML (works in browser or Node)
export function stripHtml(input: string): string {
  if (typeof window !== "undefined" && "DOMParser" in window) {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return (doc.body.textContent || "").trim();
  }
  // Node / fallback
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}
