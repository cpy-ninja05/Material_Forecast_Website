import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Map, ShoppingCart, Boxes, LogOut, Building, Users, Bell, Shield, Menu, X, ChartLine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ui/ThemeToggle';
import PlanGridLogo from '/PlanGrid.jpg';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default 64 * 4 = 256px (w-64)
  const [isResizing, setIsResizing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const resizeRef = useRef(null);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Projects', href: '/projects', icon: Building },
    { name: 'Project Map', href: '/map', icon: Map },
    { name: 'RoW Risk', href: '/row-risk', icon: Shield },
    { name: 'Forecasting', href: '/forecasting', icon: ChartLine },
    { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
    { name: 'Inventory', href: '/inventory', icon: Boxes },
    { name: 'Teams', href: '/teams', icon: Users },
  ];

  // Load saved sidebar state from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    
    if (savedWidth) {
      setSidebarWidth(parseInt(savedWidth));
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  // Handle mouse down on resize handle
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      const minWidth = 85; // Allow resizing down to 85px 
      const maxWidth = 260; // Increased maximum width
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const currentWidth = sidebarWidth;

  // Set CSS custom property for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${currentWidth}px`);
  }, [currentWidth]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0b1220]/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 h-14">
        <button
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsOpen(v => !v)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {isOpen ? <X className="h-5 w-5 text-gray-800 dark:text-white" /> : <Menu className="h-5 w-5 text-gray-800 dark:text-white" />}
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 bg-purple-600 rounded-lg overflow-hidden">
            <img src={PlanGridLogo} alt="PlanGrid" className="w-full h-full object-cover" />
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">PLANGRID</div>
        </div>
        <ThemeToggle />
      </div>

      {/* Overlay for mobile drawer */}
      {isOpen && <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#0b1220] dark:to-[#111827] flex flex-col border-r border-gray-300 dark:border-gray-800 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-transform duration-300 ease-in-out z-40 ${
          isResizing ? 'select-none shadow-lg dark:shadow-2xl' : ''
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ 
          width: `${currentWidth}px`,
          transition: isResizing ? 'none' : undefined
        }}
      >
        {/* Mobile close button inside drawer */}
        <button
          aria-label="Close menu"
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-3 right-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5 text-gray-800 dark:text-white" />
        </button>
        {/* Logo Section */}
        <div className="h-20 hidden md:flex items-center px-6 border-b border-gray-200 dark:border-gray-700/70">
          <div className="flex items-center justify-between w-full min-w-0">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg mr-3 overflow-hidden flex-shrink-0">
                <img src={PlanGridLogo} alt="PlanGrid" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden text-left">
                <div className="text-lg font-bold text-gray-900 dark:text-white truncate text-left">PLANGRID</div>
                <div className="text-xs text-gray-500 dark:text-gray-300 truncate text-left">MATERIALS PLATFORM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 min-h-0 mt-14 md:mt-0">
          <ul className="space-y-2 px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors min-w-0 ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-sm dark:bg-blue-600'
                        : 'text-gray-800 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-[#1f2937] hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title={item.name}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {currentWidth > 120 && (
                      <span className="ml-3 truncate min-w-0 flex-1 text-left">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700/70 flex-shrink-0">
          <div className={`flex items-center mb-3 min-w-0 ${currentWidth > 120 ? 'justify-between' : 'justify-center'}`}>
            <div className={`flex items-center min-w-0 ${currentWidth > 120 ? 'flex-1' : ''}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
              </div>
              {currentWidth > 120 && (
                <div className="min-w-0 flex-1 overflow-hidden text-left ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate text-left">{user?.username || 'User'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 truncate text-left">{user?.role || 'User'}</div>
                </div>
              )}
            </div>
            {currentWidth > 120 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="hidden md:block">
                  <ThemeToggle />
                </div>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-w-0 ${
              currentWidth <= 120 ? 'justify-center' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {currentWidth > 120 && (
              <span className="ml-2 truncate min-w-0 flex-1 text-left">Sign Out</span>
            )}
          </button>
        </div>

        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className="absolute right-0 top-0 h-full w-2 bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize transition-colors group hidden md:block"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-gray-400 dark:bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          {isResizing && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs px-2 py-1 rounded shadow-lg">
              {currentWidth}px
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navigation;