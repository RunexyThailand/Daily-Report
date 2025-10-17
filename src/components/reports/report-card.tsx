"use client";
import React from "react";
import type { $Enums } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export type ReportTranslate = {
  title: string;
  detail: string;
  language: $Enums.Language;
};

export type ReportProps = {
  lang: string;
  translates: ReportTranslate[];
};

export default ({ translates, lang }: ReportProps) => {
  console.log("translates", translates);
  const [language, setLanguage] = useState<string>(lang);

  const xxxx = translates.find((translate) => {
    return translate.language === language;
  });
  return (
    <>
      <div className="w-full">
        <div className="flex w-full justify-end gap-2">
          <Button
            size="sm"
            className="cursor-pointer"
            variant={language === "ja" ? "default" : "outline"}
            aria-pressed={language === "ja"}
            onClick={(e) => {
              e.stopPropagation();
              setLanguage("ja");
            }}
          >
            Japanese
          </Button>
          <Button
            size="sm"
            className="cursor-pointer"
            variant={language === "th" ? "default" : "outline"}
            aria-pressed={language === "th"}
            onClick={(e) => {
              e.stopPropagation();
              setLanguage("th");
            }}
          >
            Thai
          </Button>
          <Button
            size="sm"
            className="cursor-pointer"
            variant={language === "en" ? "default" : "outline"}
            aria-pressed={language === "en"}
            onClick={(e) => {
              e.stopPropagation();
              setLanguage("en");
            }}
          >
            English
          </Button>
        </div>
      </div>
      <div className="font-bold text-18 mb-2">
        {xxxx?.title}
        {/* {translates[} */}
      </div>
      <div
        className="tiptap"
        dangerouslySetInnerHTML={{
          __html: xxxx?.detail ?? "",
        }}
      />
    </>
  );
};
