"use client";

import * as React from "react";
import type { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Image as ImageIcon, Loader2 } from "lucide-react";

export type ImageUploadButtonProps = {
  editor: Editor | null;
  uploadImage: (file: File) => Promise<string>;
  className?: string;
  disabled?: boolean;
  title?: string;
  accept?: string;
  onUploaded?: (url: string, file: File) => void;
};

export default function ImageUploadButton({
  editor,
  uploadImage,
  className,
  disabled,
  title = "Insert image",
  accept = "image/*",
  onUploaded,
}: ImageUploadButtonProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  const openPicker = () => fileRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;

    try {
      setBusy(true);
      const url = await uploadImage(file);
      editor?.chain().focus().setImage({ src: url, alt: file.name }).run();
      onUploaded?.(url, file);
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setBusy(false);
      if (inputEl && inputEl.isConnected) inputEl.value = "";
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className={className}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={title}
              title={title}
              onClick={openPicker}
              disabled={disabled || busy || !editor}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{title}</TooltipContent>
        </Tooltip>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={onChange}
        />
      </div>
    </TooltipProvider>
  );
}
