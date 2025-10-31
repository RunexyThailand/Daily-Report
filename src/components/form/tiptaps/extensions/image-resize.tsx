"use client";

import * as React from "react";
import Image from "@tiptap/extension-image";
import NextImage from "next/image";
import {
  ReactNodeViewRenderer,
  type NodeViewProps,
  NodeViewWrapper,
} from "@tiptap/react";

function computeCornerResize(
  startW: number,
  startH: number,
  dx: number,
  dy: number,
  dirX: 1 | -1,
  dirY: 1 | -1,
  keepAspect: boolean,
) {
  const minW = 80;
  const minH = 40;
  const maxW = 4000;
  const maxH = 4000;

  if (!keepAspect) {
    const w = Math.min(maxW, Math.max(minW, Math.round(startW + dirX * dx)));
    const h = Math.min(maxH, Math.max(minH, Math.round(startH + dirY * dy)));
    return { w, h };
  }

  const ratio = startW / Math.max(1, startH);
  const dxFromDy = dirY * dy * ratio;

  const deltaW =
    Math.abs(dirX * dx) >= Math.abs(dxFromDy) ? dirX * dx : dxFromDy;

  let w = Math.min(maxW, Math.max(minW, Math.round(startW + deltaW)));
  let h = Math.round(w / ratio);

  if (h < minH) {
    h = minH;
    w = Math.round(h * ratio);
  }
  return { w, h };
}

function CornerHandle({
  onPointerDown,
  className,
  title,
}: {
  onPointerDown: React.PointerEventHandler<HTMLSpanElement>;
  className: string;
  title: string;
}) {
  return (
    <span
      contentEditable={false}
      onPointerDown={onPointerDown}
      title={title}
      className={`absolute hidden h-4 w-4 cursor-pointer items-center justify-center rounded-sm border bg-background/90 shadow-sm group-hover:flex ${className}`}
    />
  );
}

function ResizableImageInlineView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const startX = React.useRef(0);
  const startY = React.useRef(0);
  const startW = React.useRef(0);
  const startH = React.useRef(0);
  const dragging = React.useRef(false);
  const [, force] = React.useReducer((x) => x + 1, 0);

  const beginDrag = (e: React.PointerEvent, dirX: 1 | -1, dirY: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();

    const el = imgRef.current!;
    const rect = el.getBoundingClientRect();
    const widthPx = (node.attrs.width as number | null) ?? null;
    const heightPx = (node.attrs.height as number | null) ?? null;

    startW.current = widthPx ?? Math.round(rect.width);
    startH.current =
      typeof heightPx === "number"
        ? heightPx
        : Math.round(
            (widthPx ?? rect.width) *
              (el.naturalHeight / Math.max(1, el.naturalWidth)),
          );

    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = true;

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    force();

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX.current;
      const dy = ev.clientY - startY.current;
      const keepAspect = !ev.shiftKey;

      const { w, h } = computeCornerResize(
        startW.current,
        startH.current,
        dx,
        dy,
        dirX,
        dirY,
        keepAspect,
      );

      updateAttributes({
        width: w,
        height: keepAspect ? null : h,
        widthPercent: null,
      });
    };

    const onUp = () => {
      dragging.current = false;
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp, true);
      force();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, true);
  };

  const widthPx = (node.attrs.width as number | null) ?? null;
  const widthPct = (node.attrs.widthPercent as number | null) ?? null;
  const heightPx = (node.attrs.height as number | null) ?? null;

  const wrapperClass =
    `relative inline-block leading-[0] group select-none align-middle ` +
    (dragging.current ? "ring-2 ring-primary/50 " : "") +
    (selected ? "outline outline-2 outline-primary/40 " : "");

  const imgStyle: React.CSSProperties = {
    width: widthPct ? `${widthPct}%` : widthPx ? `${widthPx}px` : undefined,
    height: heightPx ? `${heightPx}px` : "auto",
    maxWidth: "100%",
    display: "inline-block",
    verticalAlign: "middle",
  };

  return (
    <NodeViewWrapper
      as="span"
      data-node-view-wrapper
      className={wrapperClass}
      contentEditable={false}
    >
      <NextImage
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        title={node.attrs.title || ""}
        style={imgStyle}
        draggable={false}
      />

      <CornerHandle
        title="Drag to resize (keep ratio). Hold Shift for free-form."
        className="top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"
        onPointerDown={(e) => beginDrag(e, -1, -1)}
      />
      <CornerHandle
        title="Drag to resize (keep ratio). Hold Shift for free-form."
        className="top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"
        onPointerDown={(e) => beginDrag(e, +1, -1)}
      />
      <CornerHandle
        title="Drag to resize (keep ratio). Hold Shift for free-form."
        className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"
        onPointerDown={(e) => beginDrag(e, -1, +1)}
      />
      <CornerHandle
        title="Drag to resize (keep ratio). Hold Shift for free-form."
        className="bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
        onPointerDown={(e) => beginDrag(e, +1, +1)}
      />
    </NodeViewWrapper>
  );
}

export const ImageResize = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w =
            (el as HTMLElement).style.width ||
            (el as HTMLElement).getAttribute("width");
          if (!w) return null;
          if (typeof w === "string") {
            const m = w.match(/^(\d+)px$/);
            if (m) return parseInt(m[1], 10);
          }
          return null;
        },
        renderHTML: (attrs) =>
          attrs.width && !attrs.widthPercent
            ? { style: `width:${attrs.width}px` }
            : {},
      },
      widthPercent: {
        default: null,
        parseHTML: (el) => {
          const w =
            (el as HTMLElement).style.width ||
            (el as HTMLElement).getAttribute("width");
          if (!w) return null;
          if (typeof w === "string") {
            const m = w.match(/^(\d+)%$/);
            if (m) return parseInt(m[1], 10);
          }
          return null;
        },
        renderHTML: (attrs) =>
          attrs.widthPercent ? { style: `width:${attrs.widthPercent}%` } : {},
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const h =
            (el as HTMLElement).style.height ||
            (el as HTMLElement).getAttribute("height");
          if (!h) return null;
          if (typeof h === "string") {
            const m = h.match(/^(\d+)px$/);
            if (m) return parseInt(m[1], 10);
          }
          return null;
        },
        renderHTML: (attrs) =>
          attrs.height ? { style: `height:${attrs.height}px` } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageInlineView);
  },
});
