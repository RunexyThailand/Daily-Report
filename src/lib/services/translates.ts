// useTranslatorV2.ts
"use client";
import { trpc } from "@/trpc/client";
import * as React from "react";

export type TranslateInput = { title: string; description: string };
export type Lang = "ja" | "th" | "en";

type DetectResult = { languageCode: string; confidence: number | null };
type TranslateResult = {
  source: DetectResult;
  original: TranslateInput;
  // ไม่มี key ของภาษาต้นฉบับ
  translations: Partial<Record<Lang, { title: string; description: string }>>;
};

export function useTranslator() {
  const utils = trpc.useUtils();

  // แปล (exclude source) — ใช้ mutation
  const mutation = trpc.translate.translateExceptSource.useMutation();

  const translate = React.useCallback(
    async (input: TranslateInput, targets: Lang[] = ["ja", "th", "en"]) => {
      const res = await mutation.mutateAsync({ ...input, targets });
      return res as TranslateResult;
    },
    [mutation],
  );

  // ตรวจจับภาษา — เรียกแบบ imperative ด้วย utils.fetch()
  const detect = React.useCallback(
    async (input: TranslateInput) => {
      const res = await utils.translate.detect.fetch(input);
      // res: { languageCode, confidence }
      return res as DetectResult;
    },
    [utils],
  );

  return {
    // actions
    translate, // (input, targets?) => Promise<TranslateResult>
    detect, // (input) => Promise<DetectResult>

    // states of last translate()
    result: mutation.data as TranslateResult | undefined,
    isTranslating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
