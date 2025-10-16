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
  title: string;
  detail: string;
  progress: number | null;
  dueDate: Date | null;
  language_id: string | null;
};

export enum formMode {
  VIEW = "VIEW",
  CREATE = "CREATE",
  EDIT = "EDIT",
}

export type ReportTrans = {
  language: "DEFAULT" | "JP";
  title: string;
  detail: string;
};

export type CreateReportInput = {
  id?: string;
  project_id: string | null;
  task_id: string | null;
  report_date: Date;
  progress: number | null;
  due_date: Date | null;
  report_trans: ReportTrans[];
};

export type ReportForm = {
  mode: formMode;
  projects: { id: string; label: string }[];
  tasks: { id: string; label: string }[];
  languages: { id: string; label: string }[];
  isLoading: boolean;
  onOpenDeleteDialog: () => void;
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
};
