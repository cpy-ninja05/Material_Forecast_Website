import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Calculator, LogOut, Home, Map, Package, ClipboardCheck, Wrench, ActivitySquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ui/ThemeToggle';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const baseNav = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Forecasting', href: '/forecasting', icon: Calculator },
    { name: 'Materials', href: '/materials', icon: Package },
    { name: 'Map View', href: '/map', icon: Map },
  ];
  const roleNav = [
    { name: 'Planning', href: '/planning', icon: ClipboardCheck, roles: ['admin','planner'] },
    { name: 'O&M', href: '/om', icon: Wrench, roles: ['admin','planner','operator'] },
    { name: 'Dispatch', href: '/dispatch', icon: ActivitySquare, roles: ['admin','operator'] },
  ];
  const navigation = [
    ...baseNav,
    ...roleNav.filter(item => !item.roles || item.roles.includes(user?.role))
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <Home className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">POWERGRID</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Welcome, <span className="font-medium">{user?.username}</span>
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
