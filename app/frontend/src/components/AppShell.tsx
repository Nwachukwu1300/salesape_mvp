// src/components/AppShell.tsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { SidebarNav } from "./SidebarNav";
import { Menu } from "lucide-react";
import { Toaster } from './ui/sonner';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const authPaths = ["/", "/login", "/register", "/onboarding"];
  if (!user || authPaths.some((p) => location.pathname.startsWith(p))) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div
        className={`
          ${mobileOpen ? "block" : "hidden"} 
          sm:block
        `}
      >
        <SidebarNav
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            onClick={() => setMobileOpen(true)}
            className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Collapse toggle for desktop */}
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="hidden sm:block ml-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
}