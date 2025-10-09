"use client";
import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import { createExtensions } from "@/components/form/tiptaps/extensions";
import { Toolbar } from "@/components/form/tiptaps/toolbars";

export type TiptapEditorProps = {
  /** Controlled HTML value (optional). If provided, parent controls the editor */
  value?: string;
  /** Fired whenever content changes (HTML) */
  onChange?: (html: string) => void;
  /** Placeholder text shown when empty */
  placeholder?: string;
  /** Wrapper className */
  className?: string;
  /** min-height for the editable area (e.g., '12rem') */
  minHeight?: string;
  /** Initial content if uncontrolled */
  defaultValue?: string;
};

export default function TiptapEditor({
  value,
  onChange,
  placeholder = "Write something…",
  className,
  minHeight = "12rem",
  defaultValue = "",
}: TiptapEditorProps) {
  const isControlled = typeof value === "string";

  const editor = useEditor({
    extensions: createExtensions(placeholder),
    content: isControlled ? value : defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert focus:outline-none max-w-none",
      },
    },
  });

  React.useEffect(() => {
    if (!editor || !isControlled) return;
    const current = editor.getHTML();
    if (value !== undefined && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor, isControlled]);

  return (
    <div className={className}>
      <Toolbar editor={editor as Editor | null} />
      <div className="rounded-xl border bg-background p-3">
        <div className="rounded-md px-2 py-1" style={{ minHeight }}>
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div className="h-24 animate-pulse rounded-md bg-muted" />
          )}
        </div>
      </div>
    </div>
  );
}
