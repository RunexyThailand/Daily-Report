"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type LayoutCtx = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
};

const Ctx = createContext<LayoutCtx | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Hydration-safe initialization: prefer localStorage; default open on lg screens
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ms_layout_sidebar_open");
      if (saved !== null) {
        setSidebarOpen(saved === "1");
      } else {
        const isLg = window.matchMedia("(min-width: 1024px)").matches;
        setSidebarOpen(isLg);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ms_layout_sidebar_open", sidebarOpen ? "1" : "0");
    } catch {}
  }, [sidebarOpen]);

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar: () => setSidebarOpen((v) => !v),
    }),
    [sidebarOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLayout() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
