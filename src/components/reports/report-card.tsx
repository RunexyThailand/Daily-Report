"use client";
import React, { useRef } from "react";
import type { $Enums } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  LoaderCircle,
  Eye,
  Trash,
  Volume2,
  CircleStop,
} from "lucide-react";
import { DateTime } from "luxon";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lang } from "@/lib/services/translates";
import { useSession } from "next-auth/react";
import { useTTS } from "@/lib/useTts";
import { stripHtml } from "@/utils/strip-html";

export type ReportTranslate = {
  title: string;
  detail: string;
  language: $Enums.Language;
};

export type ReportProps = {
  lang: string;
  translates: ReportTranslate[];
  reportDate: Date;
  reportId: string;
  dueDate: Date | null;
  projectName: string | null;
  taskName: string | null;
  progress: number | null;
  creatorId: string;
  onOpenDialog: (lang: Lang) => void;
  onDelete: () => void;
};

const ReportCard = ({
  translates,
  reportDate,
  lang,
  reportId,
  dueDate,
  projectName,
  taskName,
  progress,
  onOpenDialog,
  onDelete,
  creatorId,
}: ReportProps) => {
  const { data: session } = useSession();

  const [language, setLanguage] = useState<string>(lang);
  // const target = "ja"

  const speakTimer = useRef<number | null>(null);

  // --- TTS ---
  const { speak, cancel, speaking } = useTTS({
    // ตั้งค่าเสียงตามภาษาปลายทาง
    lang: language === "ja" ? "ja-JP" : language === "th" ? "th-TH" : "en-US",
    rate: 1,
    pitch: 1,
    volume: 1,
  });

  const translated = translates.find((translate) => {
    return translate.language === language;
  });

  const onSpeak = () => {
    speakTimer.current = window.setTimeout(() => {
      if (translated?.title || translated?.detail) {
        const newText = `${translated?.title} ${stripHtml(translated?.detail)}`;
        speak(newText);
      }
    }, 200);
  };

  return (
    <div>
      <div className="flex w-full justify-between">
        <div className="flex w-full justify-start">
          <Button
            size="sm"
            className="cursor-pointer rounded-none w-[100px]"
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
            className="cursor-pointer rounded-none w-[100px]"
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
            className="cursor-pointer rounded-none w-[100px]"
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

        <div className="flex space-x-5">
          {speaking ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleStop
                  className="h-6 w-6 cursor-pointer text-red-500"
                  aria-hidden="true"
                  onClick={() => cancel()}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Stop</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Volume2
                  className="h-6 w-6 cursor-pointer"
                  aria-hidden="true"
                  onClick={() => onSpeak()}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Speak</p>
              </TooltipContent>
            </Tooltip>
          )}

          {session?.user?.id === creatorId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Eye
                  className="h-6 w-6 cursor-pointer"
                  aria-hidden="true"
                  onClick={() => onOpenDialog(language as Lang)}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>View</p>
              </TooltipContent>
            </Tooltip>
          )}
          {session?.user?.id === creatorId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Trash
                  className="h-6 w-6 cursor-pointer text-red-500"
                  aria-hidden="true"
                  onClick={onDelete}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <Card
        className="overflow-hidden p-0 group transition-all rounded-t-none "
        key={reportId}
      >
        <CardHeader className="p-0 gap-0">
          <div
            className={cn(
              "flex w-full select-none items-center gap-3 px-4 py-3",
            )}
          >
            <div className="min-w-0 flex-1">
              <CardTitle className="flex justify-end space-x-2">
                {projectName && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: "#234868",
                      color: "#ffffff",
                    }}
                  >
                    {projectName}
                  </Badge>
                )}
                {taskName && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: "#31628eff",
                      color: "#ffffff",
                    }}
                  >
                    {taskName}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="py-5">
                <div className="w-full flex justify-end font-bold">
                  {DateTime.fromJSDate(reportDate)
                    .toFormat("yyyy-LL-dd")
                    .toString()}
                </div>
                <div className="font-bold text-18 mb-2">
                  {translated?.title}
                </div>
                <div
                  className="tiptap"
                  dangerouslySetInnerHTML={{
                    __html: translated?.detail ?? "",
                  }}
                />
              </CardDescription>
              <CardFooter className="p-0 flex justify-end space-x-4">
                <div className="flex items-center space-x-1">
                  {progress && (
                    <>
                      <LoaderCircle className="h-4 w-4" aria-hidden="true" />
                      <label>{progress}%</label>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {dueDate && (
                    <>
                      <Calendar className="h-5 w-5" aria-hidden="true" />
                      <span>
                        {DateTime.fromJSDate(dueDate).toFormat("dd/LL/yyyy")}
                      </span>
                    </>
                  )}
                </div>
              </CardFooter>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ReportCard;
