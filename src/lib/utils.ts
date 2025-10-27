import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isNotEmptyHtml = (html?: string) => {
  if (!html) return false;

  const hasImg = /<img\b[^>]*\bsrc\s*=\s*['"][^'"]+['"][^>]*>/i.test(html);
  if (hasImg) return true;

  let txt = html.replace(
    /<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi,
    "",
  );
  txt = txt.replace(
    /<(br|\/?p|\/?div|\/?span|\/?strong|\/?em|\/?u|\/?b|\/?i|\/?h[1-6]|\/?ul|\/?ol|\/?li|\/?blockquote|\/?code|\/?pre)[^>]*>/gi,
    " ",
  );
  txt = txt.replace(/<[^>]+>/g, " ");

  txt = txt
    .replace(/&nbsp;|&#160;|&#32;|\u00A0/gi, " ")
    .replace(/&[a-z]+;|&#\d+;|&#x[0-9a-f]+;/gi, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return /\S/.test(txt);
};
