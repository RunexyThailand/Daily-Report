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

export function createExtensions(placeholder: string): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true },
      orderedList: { keepMarks: true },
    }),
    Underline,
    Placeholder.configure({ placeholder }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      protocols: ["http", "https", "mailto"],
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
  ];
}
