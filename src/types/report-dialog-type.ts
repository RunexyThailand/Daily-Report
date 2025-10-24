import { Lang } from "@/lib/services/translates";

export type LangValue = {
  default: string;
  en?: string;
  ja?: string;
  th?: string;
};

export type FormValues = {
  reportDate: Date;
  project_id: string | null;
  task_id: string | null;
  title: LangValue;
  detail: LangValue;
  progress: number | null;
  dueDate: Date | null;
  language_code: Lang | null;
};

export enum formMode {
  VIEW = "VIEW",
  CREATE = "CREATE",
  EDIT = "EDIT",
}

export type ReportTrans = {
  language: "DEFAULT" | Lang;
  title: string;
  detail: string;
};

export type CreateReportInput = {
  id?: string;
  project_id: string | null;
  task_id: string | null;
  report_date: Date | null;
  progress: number | null;
  due_date: Date | null;
  title: LangValue;
  detail: LangValue;
  languageCode?: Lang | null;
  //   report_trans: ReportTrans[];
};

export type ReportForm = {
  mode: formMode;
  projects: { id: string; label: string }[];
  tasks: { id: string; label: string }[];
  languages: { id: string; label: string }[];
  isLoading: boolean;
  onClose?: () => void;
};

export type AddReportDialogProps = {
  isOpen: boolean;
  projects: { id: string; label: string }[];
  tasks: { id: string; label: string }[];
  languages: { id: string; label: string }[];
  onSuccess?: () => void;
  onClose?: () => void;
  reportData?: CreateReportInput | null;
  mode: formMode;
  reportId: string | null;
  languageCode: Lang | null;
};
