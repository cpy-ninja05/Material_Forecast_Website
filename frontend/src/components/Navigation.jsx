import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Calculator, Map, ShoppingCart, Boxes, LogOut, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ui/ThemeToggle';
import PlanGridLogo from '/PlanGrid.jpg';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Projects', href: '/projects', icon: Building },
    { name: 'Project Map', href: '/map', icon: Map },
    { name: 'Forecasting', href: '/forecasting', icon: Calculator },
    { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
    { name: 'Inventory', href: '/inventory', icon: Boxes },
  ];

  

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#0b1220] dark:to-[#111827] flex flex-col border-r border-gray-300 dark:border-gray-800 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-700/70">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg mr-3 overflow-hidden">
              <img src={PlanGridLogo} alt="PlanGrid" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">PLANGRID</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">MATERIALS PLATFORM</div>
            </div>
          </div>
          <div />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-sm dark:bg-blue-600'
                      : 'text-gray-800 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-[#1f2937] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.username || 'User'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">{user?.role || 'User'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Navigation;
