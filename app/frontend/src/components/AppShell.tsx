/**
 * App Shell Layout
 * Persistent navigation and layout structure for authenticated pages
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, Home, Settings, Zap, BarChart3, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './Logo';

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show shell on auth pages
  const isAuthPage = ['/auth', '/login', '/register', '/onboarding', '/conversation'].some(path => location.pathname.includes(path));
  
  if (isAuthPage || !user) {
    return <>{children}</>;
  }

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Content Studio', path: '/content-studio', icon: Zap },
    { label: 'Content Calendar', path: '/schedule', icon: Calendar, indent: true },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`
          fixed sm:relative inset-y-0 left-0 z-50 sm:z-auto
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform sm:transform-none transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 sm:translate-x-0 sm:w-20 md:w-64'}
        `}
        aria-label="Navigation"
      >
        {/* Sidebar Header with Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {/* Logo - Show on desktop/tablet */}
          <div 
            className="flex-shrink-0 cursor-pointer hidden sm:flex items-center justify-center md:justify-start"
            onClick={() => navigate('/dashboard')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/dashboard');
            }}
            aria-label="Home"
          >
            <Logo size="sm" />
          </div>
          {/* Close button - only on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="sm:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ml-auto"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto" aria-label="Main navigation">
          {navigationItems.map((item: any) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors justify-center sm:justify-start ${
                item.indent ? 'ml-6 text-xs' : ''
              } ${
                location.pathname === item.path
                  ? 'bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              title={item.label}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t-2 border-gray-300 dark:border-gray-600 px-2 py-4 space-y-2 mt-auto">
          <div className="hidden sm:block px-3 py-2 text-xs text-gray-600 dark:text-gray-400 truncate text-center">
            {user?.email}
          </div>
          <button
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors justify-center sm:justify-start font-medium`}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 sm:px-4 md:px-6 gap-3 sm:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="navigation"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          
          {/* Logo - Always visible on left */}
          <div 
            className="w-12 h-12 flex-shrink-0 cursor-pointer flex items-center justify-center"
            onClick={() => navigate('/dashboard')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/dashboard');
            }}
            aria-label="Home"
          >
            <Logo size="sm" variant="icon" />
          </div>
          
          <div className="flex-1" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden bg-black/50"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-pink-600 text-white px-4 py-2 rounded-br-lg"
      >
        Skip to main content
      </a>
    </div>
  );
}
