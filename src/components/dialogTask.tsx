"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { createReport } from "@/actions/report";

enum formMode {
  VIEW,
  CREATE,
  EDIT,
}

type DialogTaskProps = {
  isOpen: boolean;
  onClose?: () => void;
  mode: formMode;
  formData?: {
    project: string;
    task: string;
    title: string;
    detail: string;
    reportDate: Date;
    progress: Number;
    dueDate: Date;
  };
  report?: ReportDetail;
  onSuccess?: () => void;
};

type ReportDetail = {
  reportDate: Date;
  title?: string;
  detail?: string;
  titleJP?: string;
  detailJP?: string;
  progress?: number;
  dueDate?: Date | undefined;
};

const DialogTask = ({
  isOpen,
  onClose,
  mode,
  formData,
  report,
  onSuccess,
}: DialogTaskProps) => {
  const mockUp: ReportDetail = {
    title: "Default Title",
    detail: "Default Detail",
    titleJP: "Title JP",
    detailJP: "Detail JP",
    reportDate: new Date(),
    progress: 15,
    dueDate: new Date(),
  };
  const [selectedProject, setSelectedProject] = useState<string | null>(
    formData?.project || null,
  );
  const [open, setOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportDetail>({
    // ...report,
    ...mockUp,
    reportDate: new Date(),
  });
  const t = useTranslations();

  const handleInputChange = (value: any, key: string) => {
    setReportData({
      ...reportData,
      [key]: value,
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>
              {mode === formMode.CREATE
                ? "Add Task"
                : mode === formMode.EDIT
                  ? "Edit Task"
                  : "View Task"}
            </DialogTitle>
          </DialogHeader>
        </VisuallyHidden>
        <DialogDescription>
          <FieldGroup>
            <FieldSet>
              <FieldLabel>Task info</FieldLabel>
              <FieldDescription>
                <>
                  <form
                    action={async (e) => {
                      await createReport({
                        project_id: null,
                        task_id: null,
                        report_date: new Date(),
                        progress: reportData.progress ?? null,
                        due_date: reportData.dueDate ?? null,
                        report_trans: [
                          {
                            language: "DEFAULT",
                            title: reportData.title ?? "",
                            detail: reportData.detail ?? "",
                          },
                          {
                            language: "JP",
                            title: reportData.titleJP ?? "",
                            detail: reportData.detailJP ?? "",
                          },
                        ],
                      });
                      onSuccess && onSuccess();
                    }}
                  >
                    <Select
                      value={selectedProject || undefined}
                      onValueChange={(value) => setSelectedProject(value)}
                    >
                      <SelectTrigger className="w-full my-4">
                        <SelectValue placeholder="Project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MylogStar">MylogStar</SelectItem>
                        <SelectItem value="RunDX">RunDX</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="w-full mb-4">
                        <SelectValue placeholder="Task" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Documentation">
                          Documentation
                        </SelectItem>
                        <SelectItem value="Test">Test</SelectItem>
                      </SelectContent>
                    </Select>
                    <Tabs defaultValue="1" className="w-full">
                      <TabsList>
                        <TabsTrigger value="1">Default</TabsTrigger>
                        <TabsTrigger value="2">JP</TabsTrigger>
                      </TabsList>
                      <TabsContent value="1">
                        <Input
                          placeholder={t("Common.title")}
                          className="w-full mb-4"
                          type="text"
                          name="title"
                          onChange={(e) => {
                            handleInputChange(e.target.value, "title");
                          }}
                          value={reportData.title}
                        />
                        <Textarea
                          placeholder={t("Common.description")}
                          className="w-full mb-4"
                          name="detail"
                          onChange={(e) => {
                            handleInputChange(e.target.value, "detail");
                          }}
                          value={reportData.detail}
                        />
                      </TabsContent>
                      <TabsContent value="2">
                        <Input
                          placeholder={t("Common.title")}
                          className="w-full mb-4"
                          type="text"
                          name="titleJP"
                          onChange={(e) => {
                            handleInputChange(e.target.value, "titleJP");
                          }}
                          value={reportData.titleJP}
                        />
                        <Textarea
                          placeholder={t("Common.description")}
                          className="w-full mb-4"
                          name="detailJP"
                          onChange={(e) => {
                            handleInputChange(e.target.value, "detailJP");
                          }}
                          value={reportData.detailJP}
                        />
                      </TabsContent>
                    </Tabs>
                    <Input
                      placeholder={`${t("Common.progress")} (%)`}
                      className="w-full mb-4"
                      type="number"
                      name="progress"
                      onChange={(e) => {
                        handleInputChange(parseInt(e.target.value), "progress");
                      }}
                      value={reportData.progress}
                      max={100}
                      maxLength={3}
                    />
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date"
                          className="w-full justify-between font-normal mb-4"
                        >
                          {reportData.dueDate
                            ? reportData.dueDate.toLocaleDateString()
                            : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={reportData.dueDate}
                          captionLayout="dropdown"
                          onSelect={(date: Date | undefined) => {
                            setOpen(false);
                            handleInputChange(date, "dueDate");
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {mode !== formMode.VIEW && (
                      <Button variant="outline">SAVE</Button>
                    )}
                  </form>
                </>
              </FieldDescription>
            </FieldSet>

            {mode === formMode.VIEW && (
              <>
                <FieldSeparator />
                <FieldSet>
                  <FieldLabel>{t("Common.comment")}</FieldLabel>
                  <FieldDescription>
                    <Textarea
                      placeholder={t("Common.comment")}
                      className="w-full mb-4"
                    />
                    <Button variant="outline">COMMENT</Button>
                  </FieldDescription>
                </FieldSet>
              </>
            )}
          </FieldGroup>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default DialogTask;
