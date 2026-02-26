// src/components/SidebarNav.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wand2, Image, Settings, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Logo } from "./Logo";

interface SidebarNavProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SidebarNav({ collapsed, setCollapsed }: SidebarNavProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Create Website", path: "/create-website", icon: Wand2 },
    { name: "Content Studio", path: "/content-studio", icon: Image },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`
        fixed sm:relative z-40
        h-screen bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo Section */}
      <div
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-3 px-4 py-4 cursor-pointer"
      >
        <Logo size="sm" />
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight">
            SalesApe
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="mt-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `
              }
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-4 left-0 w-full px-2">
        <button
          onClick={async () => {
            await signOut();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}