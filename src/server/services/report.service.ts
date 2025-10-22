import type { PrismaClient, Language } from "@prisma/client";
import type { ReportInput } from "../routers/types";
import { LangValue } from "@/types/report-dialog-type";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

const ALL_LANGS = ["ja", "th", "en"] as const;
type Lang = (typeof ALL_LANGS)[number];

const isNonEmpty = (s?: string | null) => !!s && s.trim().length > 0;

function prepareTranslations(input: ReportInput) {
  const out: Array<{ language: Language; title: string; detail: string }> = [];
  for (const lang of ALL_LANGS) {
    const t = input.title[lang];
    const d = input.detail[lang];
    if (isNonEmpty(t) && isNonEmpty(d)) {
      out.push({
        language: lang as Language,
        title: t!.trim(),
        detail: d!.trim(),
      });
    }
  }
  return out;
}

function checkMissingLangs(obj: LangValue): ("en" | "ja" | "th")[] {
  const langs: ("en" | "ja" | "th")[] = ["en", "ja", "th"];
  return langs.filter((l) => !obj[l] || obj[l]!.trim() === "");
}

const checkTranslation = async (input: ReportInput) => {
  const caller = appRouter.createCaller(await createTRPCContext());

  const langNotTranslation = checkMissingLangs(input.title);
  if (langNotTranslation.length > 0) {
    const result = await caller.translate.translateExceptSource({
      title: input.title.default,
      description: input.detail.default,
      targets: langNotTranslation,
    });

    let titleTrans: {
      en?: string | undefined;
      ja?: string | undefined;
      th?: string | undefined;
    } = {};

    let detailTrans: {
      en?: string | undefined;
      ja?: string | undefined;
      th?: string | undefined;
    } = {};

    for (const lang of Object.keys(result.translations) as Lang[]) {
      const t = result.translations[lang]!;
      titleTrans[lang] = t.title;
      detailTrans[lang] = t.description;
    }

    titleTrans[input.language_code ?? (result.source.languageCode as Lang)] =
      input.title.default;
    detailTrans[input.language_code ?? (result.source.languageCode as Lang)] =
      input.detail.default;
    return {
      ...input,
      title: { ...input.title, ...titleTrans },
      detail: { ...input.detail, ...detailTrans },
    };
  }
  return input;
};

export async function createReportService(
  prisma: PrismaClient,
  input: ReportInput,
  createdByUserId: string,
) {
  const newInput: ReportInput = await checkTranslation(input);
  const translations = prepareTranslations(newInput);
  if (translations.length === 0) {
    throw new Error("At least one language (title & detail) is required.");
  }

  return await prisma.$transaction(async (tx) => {
    if (!createdByUserId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing createdByUserId",
      });
    }

    const user = await tx.user.findUnique({
      where: { id: createdByUserId },
      select: { id: true },
    });
    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Invalid createdByUserId: ${createdByUserId}`,
      });
    }

    if (input.project_id) {
      const project = await tx.project.findUnique({
        where: { id: input.project_id },
        select: { id: true },
      });
      if (!project)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid project_id",
        });
    }
    if (input.task_id) {
      const task = await tx.task.findUnique({
        where: { id: input.task_id },
        select: { id: true },
      });
      if (!task)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid task_id",
        });
    }

    const report = await tx.report.create({
      data: {
        project_id: input.project_id ?? null,
        task_id: input.task_id ?? null,
        report_date: input.reportDate,
        progress: input.progress,
        due_date: input.dueDate ?? null,
        created_by: createdByUserId,
      },
      select: { id: true },
    });

    await tx.report_trans.createMany({
      data: translations.map((t) => ({
        report_id: report.id,
        language: t.language,
        title: t.title,
        detail: t.detail,
      })),
      skipDuplicates: true,
    });

    return tx.report.findUnique({
      where: { id: report.id },
      include: { report_trans: true, project: true, task: true },
    });
  });
}

export async function updateReportService(
  prisma: PrismaClient,
  id: string,
  input: ReportInput,
  opts?: { removeMissing?: boolean },
) {
  const removeMissing = opts?.removeMissing ?? false;
  const newInput: ReportInput = await checkTranslation(input);
  const translations = prepareTranslations(newInput);

  if (id === "") return [];

  return await prisma.$transaction(async (tx) => {
    await tx.report.update({
      where: { id },
      data: {
        project_id: input.project_id,
        task_id: input.task_id,
        report_date: input.reportDate,
        progress: input.progress,
        due_date: input.dueDate,
      },
    });

    for (const t of translations) {
      const existing = await tx.report_trans.findFirst({
        where: { report_id: id, language: t.language },
        select: { id: true },
      });

      if (existing) {
        await tx.report_trans.update({
          where: { id: existing.id },
          data: { title: t.title, detail: t.detail },
        });
      } else {
        await tx.report_trans.create({
          data: {
            report_id: id,
            language: t.language,
            title: t.title,
            detail: t.detail,
          },
        });
      }
    }

    if (removeMissing) {
      const keep = translations.map((t) => t.language);
      await tx.report_trans.deleteMany({
        where: { report_id: id, language: { notIn: keep } },
      });
    }

    return tx.report.findUnique({
      where: { id },
      include: { report_trans: true, project: true, task: true },
    });
  });
}
