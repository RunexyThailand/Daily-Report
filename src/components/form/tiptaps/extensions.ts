import type { Extensions } from "@tiptap/core";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import ListItem from "@tiptap/extension-list-item";
import { FontSize } from "@/components/form/tiptaps/extensions/font-size";
import Image from "@tiptap/extension-image";
import { ImageResize } from "@/components/form/tiptaps/extensions/image-resize";
import { TrailingNode } from "@tiptap/extensions";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Code from "@tiptap/extension-code";

export function createExtensions(placeholder: string): Extensions {
  return [
    TrailingNode.configure({
      node: "paragraph",
      notAfter: ["codeBlock"], // กันเคสหลัง codeBlock บางทีวางเคอร์เซอร์ยาก
    }),
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true },
      orderedList: { keepMarks: true },
    }),
    // BulletList,
    Underline,
    // Markdown.configure({
    //   // แนะนำเปิดสองอันนี้: วางเป็น MD และคัดลอกเป็น MD
    //   transformPastedText: true,
    //   transformCopiedText: true,
    //   // ตั้งค่า markdown-it เพิ่มได้ เช่น breaks: true
    //   // html: false  // ตั้งค่าเป็น true ถ้าต้องการอนุญาต HTML ใน MD
    // }),
    Placeholder.configure({ placeholder }),
    Link.configure({
      autolink: true, // พิมพ์ URL แล้วกลายเป็นลิงก์อัตโนมัติ
      linkOnPaste: true, // วาง URL แล้วเป็นลิงก์
      openOnClick: false, // คลิกใน editor แล้วไม่เด้งหน้าใหม่
      HTMLAttributes: {
        rel: "noopener noreferrer nofollow",
        target: "_blank", // อยากให้เปิดแท็บใหม่เมื่อ render นอก editor
        class: "tiptap-link", // hook ไว้ใส่ CSS ของเรา
      },
      validate: (href) => /^https?:\/\/|^mailto:|^tel:/i.test(href),
    }),
    TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle,
    FontSize,
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    ImageResize.configure({
      inline: true,
      allowBase64: false,
      HTMLAttributes: { class: "rounded-md" }, // แล้วแต่ต้องการ
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Code,
  ];
}
