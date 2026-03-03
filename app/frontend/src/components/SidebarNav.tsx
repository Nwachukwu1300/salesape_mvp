// src/components/SidebarNav.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wand2,
  BookOpen,
  Settings,
  LogOut,
  Plus,
  ChevronRight,
  PanelLeftClose,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Logo } from "./Logo";

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}

export function SidebarNav({
  collapsed = false,
  onNavigate,
  onToggleCollapse,
}: SidebarNavProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const mainNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Content Studio", path: "/content-studio", icon: BookOpen },
  ];

  const handleStartBuild = () => {
    navigate("/create-website");
    onNavigate?.();
  };

  return (
    <aside
      className={`
        relative z-0 flex-shrink-0
        min-h-screen bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out
        flex flex-col
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Header with Logo */}
      <div className="group p-4 border-b border-gray-200 dark:border-gray-800">
        <div
          onClick={() => {
            navigate("/dashboard");
            onNavigate?.();
          }}
          className={`
            flex items-center gap-3 cursor-pointer
            rounded-lg px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors
          `}
        >
          <Logo size="sm" />
          {!collapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-900 focus-visible:opacity-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Action */}
      {!collapsed && (
        <div className="p-3">
          <button
            onClick={handleStartBuild}
            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
            className={`
              w-full flex items-center justify-center gap-2
              px-4 py-2 rounded-lg
              font-medium text-sm
              transition-all duration-200
              shadow-sm hover:shadow-md hover:brightness-95
            `}
          >
            <Plus className="w-4 h-4" />
            Create Website
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"} py-4 space-y-2`}>
        {mainNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                `
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  text-sm font-medium
                  transition-all duration-200
                  relative group
                  ${
                    isActive
                      ? `
                        bg-blue-50 dark:bg-blue-900/30
                        text-blue-600 dark:text-blue-400
                        shadow-sm
                      `
                      : `
                        text-gray-700 dark:text-gray-300
                        hover:bg-gray-100 dark:hover:bg-gray-800/50
                      `
                  }
                `
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-3 py-2">
        <div className="h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Bottom Section - Settings & Logout */}
      <div className={`${collapsed ? "px-2" : "px-3"} py-4 space-y-2`}>
        <NavLink
          to="/settings"
          onClick={() => onNavigate?.()}
          className={({ isActive }) =>
            `
              flex items-center gap-3 px-3 py-2 rounded-lg
              text-sm font-medium
              transition-all duration-200
              ${
                isActive
                  ? `
                    bg-gray-100 dark:bg-gray-800
                    text-gray-900 dark:text-white
                  `
                  : `
                    text-gray-700 dark:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-800/50
                  `
              }
            `
          }
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={async () => {
            await signOut();
            navigate("/login");
            onNavigate?.();
          }}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg
            text-sm font-medium
            text-gray-700 dark:text-gray-300
            hover:bg-red-50 dark:hover:bg-red-900/20
            hover:text-red-600 dark:hover:text-red-400
            transition-all duration-200
          `}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Sidebar collapse is controlled from top bar for consistent UX */}
    </aside>
  );
}
