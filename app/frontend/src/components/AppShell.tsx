// src/components/AppShell.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { Menu, X } from "lucide-react";
import { Toaster } from "./ui/sonner";
import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const raw = window.localStorage.getItem("salesape.desktopSidebarOpen");
    return raw === null ? true : raw === "true";
  });
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 639px)").matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const closeMobileSidebarOnDesktop = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };

    if (mediaQuery.matches) setMobileOpen(false);
    mediaQuery.addEventListener("change", closeMobileSidebarOnDesktop);
    return () => mediaQuery.removeEventListener("change", closeMobileSidebarOnDesktop);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("salesape.desktopSidebarOpen", String(desktopSidebarOpen));
  }, [desktopSidebarOpen]);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const updateViewport = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);

    setIsMobileViewport(mobileQuery.matches);
    mobileQuery.addEventListener("change", updateViewport);
    return () => mobileQuery.removeEventListener("change", updateViewport);
  }, []);

  const chromeHiddenPaths = new Set(["/", "/login", "/register", "/audit"]);
  if (chromeHiddenPaths.has(location.pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh w-full overflow-x-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      {!isMobileViewport && desktopSidebarOpen && (
        <div className="w-64 shrink-0">
          <div className="sticky top-0 h-dvh">
            <SidebarNav
              onNavigate={() => setMobileOpen(false)}
              onToggleCollapse={() => setDesktopSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobileViewport && mobileOpen && (
        <>
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm">
            <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
          <div
            className="fixed inset-0 bg-transparent z-40"
            onClick={() => setMobileOpen(false)}
          />
        </>
      )}

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Sidebar toggle */}
        {(isMobileViewport || !desktopSidebarOpen) && (
          <button
            onClick={() => {
              if (isMobileViewport) {
                setMobileOpen((prev) => !prev);
              } else {
                setDesktopSidebarOpen(true);
              }
            }}
            className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isMobileViewport ? (mobileOpen ? "Close menu" : "Open menu") : "Open sidebar"}
          >
            {isMobileViewport && mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Dedicated theme dock */}
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900/90"
          aria-label="Theme controls"
        >
          <ThemeToggle />
        </div>

        {/* Content */}
        <main className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-16">
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
}
