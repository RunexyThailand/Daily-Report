"use client";
import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import { createExtensions } from "@/components/form/tiptaps/extensions";
import { Toolbar } from "@/components/form/tiptaps/toolbars";
import { TextSelection } from "@tiptap/pm/state";

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
  readOnly?: boolean;
};

export default function TiptapEditor({
  value,
  onChange,
  placeholder = "Write something…",
  className,
  minHeight = "12rem",
  defaultValue = "",
  readOnly = false,
}: TiptapEditorProps) {
  const isControlled = typeof value === "string";

  const editor = useEditor({
    editable: !readOnly,
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
      handleDOMEvents: {
        mousedown: (view, event) => {
          const e = event as MouseEvent;
          const pos = view.posAtCoords({ left: e.clientX, top: e.clientY });

          if (pos && pos.pos != null) {
            return false;
          }

          const docEnd = view.state.doc.content.size;
          const sel = TextSelection.near(view.state.doc.resolve(docEnd));
          const tr = view.state.tr.setSelection(sel);
          view.dispatch(tr);
          view.focus();
          return true;
        },
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
      <div className="rounded-xl border bg-background">
        {!readOnly && (
          <div className="border border-0 flex border-b-1 mb-2 p-2 bg-[#f4fafd] rounded-t-xl">
            <Toolbar editor={editor as Editor | null} />
          </div>
        )}

        <div
          className="rounded-md p-3 py-1"
          style={{ minHeight }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              editor?.commands.focus("end");
              e.preventDefault();
            }
          }}
        >
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
