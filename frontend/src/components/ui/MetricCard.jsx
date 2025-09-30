import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  prefix = '', 
  suffix = '',
  className = ''
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'negative':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getIconColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            />
            {change !== undefined && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getChangeColor()}`}>
                {changeType === 'positive' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : changeType === 'negative' ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${getIconColor().replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${getIconColor()}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;

