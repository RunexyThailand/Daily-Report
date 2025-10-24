// TableControls.tsx
import * as React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  Plus,
  Rows,
  Columns,
  Split,
  Merge,
  Trash2,
  ChevronDown,
  Heading,
} from "lucide-react";

type Props = { editor: Editor | null | undefined };

export default function TableControls({ editor }: Props) {
  const isTable = !!editor?.isActive("table");

  const run = (fn: (e: Editor) => void) => () => editor && fn(editor);

  return (
    <div className="flex flex-wrap items-center gap-2 p-2">
      <Button
        size="sm"
        className="gap-1"
        onClick={run((e) =>
          e
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
        )}
      >
        <Table className="h-4 w-4" />
        Insert 3×3
      </Button>

      <Button
        size="sm"
        variant="destructive"
        className="gap-1"
        disabled={!isTable}
        onClick={run((e) => e.chain().focus().deleteTable().run())}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Columns */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={!isTable}
            className="gap-1"
          >
            <Columns className="h-4 w-4" />
            Columns
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Columns className="h-4 w-4" /> คอลัมน์
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={run((e) => e.chain().focus().addColumnBefore().run())}
          >
            <Plus className="mr-2 h-4 w-4" /> เพิ่มก่อนหน้า
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={run((e) => e.chain().focus().addColumnAfter().run())}
          >
            <Plus className="mr-2 h-4 w-4" /> เพิ่มถัดไป
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={run((e) => e.chain().focus().deleteColumn().run())}
          >
            <Trash2 className="mr-2 h-4 w-4" /> ลบคอลัมน์
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rows */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={!isTable}
            className="gap-1"
          >
            <Rows className="h-4 w-4" />
            Rows
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Rows className="h-4 w-4" /> แถว
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={run((e) => e.chain().focus().addRowBefore().run())}
          >
            <Plus className="mr-2 h-4 w-4" /> เพิ่มก่อนหน้า
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={run((e) => e.chain().focus().addRowAfter().run())}
          >
            <Plus className="mr-2 h-4 w-4" /> เพิ่มถัดไป
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={run((e) => e.chain().focus().deleteRow().run())}
          >
            <Trash2 className="mr-2 h-4 w-4" /> ลบแถว
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Merge / Split */}
      <Button
        size="sm"
        variant="secondary"
        disabled={!isTable}
        className="gap-1"
        onClick={run((e) => e.chain().focus().mergeCells().run())}
      >
        <Merge className="h-4 w-4" />
        Merge
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={!isTable}
        className="gap-1"
        onClick={run((e) => e.chain().focus().splitCell().run())}
      >
        <Split className="h-4 w-4" />
        Split
      </Button>

      {/* Headers */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={!isTable}
            className="gap-1"
          >
            <Heading className="h-4 w-4" />
            Headers
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Heading className="h-4 w-4" /> หัวตาราง
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={run((e) => e.chain().focus().toggleHeaderRow().run())}
          >
            Toggle header row
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={run((e) => e.chain().focus().toggleHeaderColumn().run())}
          >
            Toggle header column
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={run((e) => e.chain().focus().toggleHeaderCell().run())}
          >
            Toggle header cell
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
