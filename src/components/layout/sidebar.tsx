"use client";

import { useEffect, useState } from "react";
import { useLayout } from "@/components/layout/layout-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "@/components/ui/nav-link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  NotebookPen,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import clsx from "clsx";

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useLayout();
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mm = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLg(mm.matches);
    update();
    mm.addEventListener("change", update);
    return () => mm.removeEventListener("change", update);
  }, []);

  if (!isLg) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-4 py-3">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <Separator />
          <nav className="grid gap-1 p-2">
            <NavLink
              href="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
            >
              Dashboard
            </NavLink>
            <NavLink href="/reports" icon={<NotebookPen className="h-4 w-4" />}>
              Reports
            </NavLink>
            <NavLink href="/settings" icon={<Settings className="h-4 w-4" />}>
              Settings
            </NavLink>
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "hidden border-r bg-card/30 backdrop-blur lg:flex lg:flex-col",
        sidebarOpen && "w-64",
      )}
    >
      <div
        className={clsx(
          "flex h-14 items-center  px-3",
          sidebarOpen ? "justify-between" : "justify-center",
        )}
      >
        {sidebarOpen && <div className="font-semibold text-sm">Navigation</div>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? (
            <ChevronLeft className="h-7 w-7" />
          ) : (
            <ChevronRight className="h-7 w-7" />
          )}
          <span className="sr-only">Collapse sidebar</span>
        </Button>
      </div>
      <Separator />

      <nav className="grid gap-1 p-2">
        <NavLink
          collapsed={!sidebarOpen}
          href="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
        >
          Dashboard
        </NavLink>
        <NavLink
          collapsed={!sidebarOpen}
          href="/reports"
          icon={<NotebookPen className="h-4 w-4" />}
        >
          Reports
        </NavLink>
        <NavLink
          collapsed={!sidebarOpen}
          href="/settings"
          icon={<Settings className="h-4 w-4" />}
        >
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}
