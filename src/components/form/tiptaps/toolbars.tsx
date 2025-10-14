"use client";
import * as React from "react";
import type { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";
import { LinkDialog } from "./link-dialog";
import { fileToDataUrl } from "@/lib/data-to-url";
import { trpc } from "@/trpc/client";
import { FontSizeSelect } from "@/components/form/tiptaps/font-size-selected";
import ColorSelected from "./color-selected";
import ImageUploadButton from "../image-upload-button";

export type ToolbarProps = { editor: Editor | null };

function useTiptapRerender(editor: Editor | null) {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    if (!editor) return;
    const rerender = () => force((x) => x + 1);
    editor.on("selectionUpdate", rerender);
    editor.on("transaction", rerender);
    editor.on("update", rerender);
    return () => {
      editor.off("selectionUpdate", rerender);
      editor.off("transaction", rerender);
      editor.off("update", rerender);
    };
  }, [editor]);
}

export function Toolbar({ editor }: ToolbarProps) {
  useTiptapRerender(editor);
  const [linkOpen, setLinkOpen] = React.useState(false);

  const uploadMut = trpc.uploadImageToLocal.useMutation();

  if (!editor) {
    return (
      <div className="mb-2">
        <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  const isActive = (name: string, attrs?: Record<string, unknown>): boolean =>
    editor.isActive(name, attrs);

  const buttonClass = (active: boolean): string => {
    return `h-9 px-2 ${active ? "bg-[#7ccac7] text-accent-foreground" : ""}`;
  };

  const currentColor = editor?.getAttributes("textStyle")?.color ?? "#000000";
  const currentSize = editor?.getAttributes("textStyle")?.fontSize ?? "";

  async function uploadImage(file: File): Promise<string> {
    const MAX = 8 * 1024 * 1024;
    if (file.size > MAX) throw new Error("ไฟล์ใหญ่เกินไป (>8MB)");

    const dataUrl = await fileToDataUrl(file);
    const { url } = await uploadMut.mutateAsync({
      dataUrl,
      filename: file.name,
    });
    return url;
  }
  const isBold = !!editor?.isActive("bold");
  console.log("isBold", isBold);

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1">
      <div className="flex items-center gap-1 flex-wrap">
        <FontSizeSelect
          current={currentSize}
          onChange={(value) => editor?.chain().focus().setFontSize(value).run()}
        />
        <ColorSelected
          editor={editor}
          fallback={currentColor}
          onChange={(value) => editor?.chain().focus().setColor(value).run()}
        />
        <ImageUploadButton editor={editor} uploadImage={uploadImage} />

        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("underline"))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("strike"))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("heading", { level: 1 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("heading", { level: 2 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("blockquote"))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("codeBlock"))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          aria-label="Code block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("paragraph", { textAlign: "left" }))}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          aria-label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={buttonClass(
            isActive("paragraph", { textAlign: "center" }),
          )}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          aria-label="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={buttonClass(isActive("paragraph", { textAlign: "right" }))}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          aria-label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Button
          type="button"
          variant="ghost"
          onClick={() => setLinkOpen(true)}
          className={buttonClass(isActive("link"))}
          aria-label="Set link"
        >
          <Link2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          aria-label="Clear formatting"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>

      <LinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        onSubmit={(href) => {
          if (!href) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href })
            .run();
        }}
        currentHref={
          (editor.getAttributes("link")?.href as string | undefined) ?? ""
        }
      />
    </div>
  );
}
