import React, { useState } from 'react';
import { Filter, X, MapPin, Calendar, Package, AlertTriangle } from 'lucide-react';

const FilterSidebar = ({ isOpen, onClose, onApplyFilters, filters, setFilters }) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    setFilters(tempFilters);
    onApplyFilters(tempFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      location: 'all',
      towerType: 'all',
      substationType: 'all',
      riskLevel: 'all',
      dateRange: 'all',
      materialType: 'all',
      project: 'all'
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const locationOptions = ['North', 'South', 'East', 'West', 'Central'];
  const towerTypeOptions = ['Tension', 'Transposition', 'Terminal', 'Suspension'];
  const substationTypeOptions = ['132 kV AIS', '132 kV GIS', '220 kV AIS', '400 kV GIS'];
  const riskOptions = ['Low', 'Medium', 'High'];
  const dateRangeOptions = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last year', 'All time'];
  const materialOptions = ['Steel (Tons)', 'Copper (Tons)', 'Cement (Tons)', 'Aluminum (Tons)', 'Insulators (Count)', 'Conductors (Tons)', 'Transformers (Count)', 'Switchgears (Count)', 'Cables (Count)', 'Protective Relays (Count)', 'Oil (Tons)', 'Foundation Concrete (Tons)', 'Bolts (Count)'];
  const projectOptions = ['P0001', 'P0002', 'P0003', 'P0004', 'P0005', 'P0006', 'P0007', 'P0008', 'P0009', 'P0010'];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-full pb-24">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Project Location
            </label>
            <select
              value={tempFilters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Locations</option>
              {locationOptions.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Tower Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tower Type
            </label>
            <select
              value={tempFilters.towerType}
              onChange={(e) => handleFilterChange('towerType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Tower Types</option>
              {towerTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Substation Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Substation Type
            </label>
            <select
              value={tempFilters.substationType}
              onChange={(e) => handleFilterChange('substationType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Substation Types</option>
              {substationTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Risk Level
            </label>
            <select
              value={tempFilters.riskLevel}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Risk Levels</option>
              {riskOptions.map(risk => (
                <option key={risk} value={risk}>{risk}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Date Range
            </label>
            <select
              value={tempFilters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              {dateRangeOptions.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          {/* Material Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Package className="h-4 w-4 mr-1" />
              Material Type
            </label>
            <select
              value={tempFilters.materialType}
              onChange={(e) => handleFilterChange('materialType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Materials</option>
              {materialOptions.map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Project
            </label>
            <select
              value={tempFilters.project}
              onChange={(e) => handleFilterChange('project', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Projects</option>
              {projectOptions.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
