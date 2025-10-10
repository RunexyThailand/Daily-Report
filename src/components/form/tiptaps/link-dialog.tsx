"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LinkDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSubmit: (href: string) => void;
  currentHref?: string;
};

export function LinkDialog({
  open,
  onOpenChange,
  onSubmit,
  currentHref,
}: LinkDialogProps) {
  const [href, setHref] = React.useState<string>(currentHref ?? "");

  React.useEffect(() => {
    setHref(currentHref ?? "");
  }, [currentHref, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set link</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="href">URL</Label>
          <Input
            id="href"
            type="url"
            placeholder="https://example.com"
            value={href}
            onChange={(e) => setHref(e.target.value)}
          />
        </div>
        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onSubmit(href.trim());
                onOpenChange(false);
              }}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
