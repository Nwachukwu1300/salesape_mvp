import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { 
  LayoutDashboard, 
  Plus, 
  Settings, 
  LogOut,
  ChevronRight,
  Zap,
  Gauge,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarNavProps {
  currentPath?: string;
}

export function SidebarNav({ currentPath }: SidebarNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Only show sidebar if user is authenticated
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const activePath = currentPath || location.pathname;
  const isActive = (path: string) => activePath === path || activePath.startsWith(path + '/');

  const getNavButtonClass = (path: string): string => {
    const baseClass = 'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all';
    if (isActive(path)) {
      return baseClass + ' bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105';
    }
    return baseClass + ' text-purple-100 hover:bg-purple-600/40';
  };

  // Sidebar is open if either toggled or hovered
  const isSidebarVisible = sidebarOpen || isHovered;

  const sidebarClass = `fixed left-0 top-0 h-full w-72 shadow-2xl z-50 transition-all transform ${
    isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
  }`;

  return (
    <>
      {/* Hamburger Toggle Button - Top Left */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
        aria-label="Toggle sidebar"
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? (
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Hover trigger area on left edge */}
      <div 
        className="fixed left-0 top-0 w-2 h-full z-30 transition-all md:block hidden"
        style={{
          backgroundColor: isHovered ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Sidebar Navigation */}
      <div
        className={sidebarClass}
        style={{
          background: 'linear-gradient(180deg, rgb(88, 28, 135) 0%, rgb(59, 13, 126) 100%)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-purple-700/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Logo variant="icon" size="md" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">SalesApe</h1>
              <p className="text-xs text-purple-200">Marketing Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => handleNavigation('/dashboard')}
            className={getNavButtonClass('/dashboard')}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Dashboard</span>
            {isActive('/dashboard') && <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />}
          </button>

          <button
            onClick={() => handleNavigation('/create-website')}
            className={getNavButtonClass('/create-website')}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Create Website</span>
            {isActive('/create-website') && <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />}
          </button>

          <button
            onClick={() => handleNavigation('/content-studio')}
            className={getNavButtonClass('/content-studio')}
          >
            <Zap className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Content Studio</span>
            {isActive('/content-studio') && <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />}
          </button>

          <button
            onClick={() => handleNavigation('/analytics')}
            className={getNavButtonClass('/analytics')}
          >
            <Gauge className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Analytics</span>
            {isActive('/analytics') && <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />}
          </button>

          <button
            onClick={() => handleNavigation('/settings')}
            className={getNavButtonClass('/settings')}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Settings</span>
            {isActive('/settings') && <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />}
          </button>
        </nav>

        {/* User Section */}
        <div className="border-t border-purple-700/60 p-4 space-y-3 bg-purple-900/40">
          {user && (
            <div className="px-4 py-3 bg-purple-700/50 rounded-lg">
              <p className="text-sm font-medium text-white truncate">{user.email}</p>
              <p className="text-xs text-purple-200">Pro Account</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/25 text-red-200 hover:bg-red-600/40 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>

        {/* Brand Footer */}
        <div className="px-4 py-3 border-t border-purple-700/60 text-xs text-purple-300 text-center bg-purple-900/30">
          <p className="font-semibold">© 2024 SalesApe</p>
          <p className="text-purple-400 mt-0.5 text-xs">Your AI Marketing Assistant</p>
        </div>
      </div>
    </>
  );
}

