import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, MapPin, AlertTriangle, 
  Package, Activity, Users, Calendar, Filter, RefreshCw,
  Zap, TrendingDown, Eye, BarChart3, Target, Shield
} from 'lucide-react';
import axios from 'axios';
import MetricCard from './ui/MetricCard';
import InteractiveChart from './ui/InteractiveChart';
import DataTable from './ui/DataTable';
import FilterSidebar from './ui/FilterSidebar';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [materialsTrend, setMaterialsTrend] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [filters, setFilters] = useState({
    location: 'all',
    towerType: 'all',
    substationType: 'all',
    riskLevel: 'all',
    dateRange: 'all',
    materialType: 'all'
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [overviewRes, materialsRes, projectsRes, dispatchRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/overview'),
        axios.get('http://localhost:5000/api/analytics/materials'),
        axios.get('http://localhost:5000/api/analytics/projects'),
        axios.get('http://localhost:5000/api/dispatch')
      ]);

      setOverview(overviewRes.data);
      setMaterialsTrend(materialsRes.data);
      setProjects(projectsRes.data);
      setDispatchLogs(dispatchRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // In a real app, you would filter the data based on these filters
    console.log('Applied filters:', newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Unable to load dashboard data</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const locationData = Object.entries(overview.location_distribution).map(([location, count]) => ({
    name: location,
    value: count
  }));

  const riskData = Object.entries(overview.risk_distribution).map(([risk, count]) => ({
    name: risk,
    value: count
  }));

  // Get top 5 materials by total consumption
  const materialData = Object.entries(overview.material_totals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([material, total]) => ({
      name: material,
      value: total
    }));

  // Prepare trend data for line chart
  const trendData = materialsTrend ? Object.keys(materialsTrend).slice(0, 3).map(key => ({
    name: key,
    data: materialsTrend[key].values || []
  })) : [];

  // Prepare data for material consumption chart
  const materialConsumptionData = [{
    name: 'Material Consumption',
    data: materialData.map(item => item.value)
  }];

  const materialCategories = materialData.map(item => item.name);

  // Prepare dispatch charts
  const dispatchSorted = [...dispatchLogs].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
  const dispatchSeries = [
    { name: 'Demand (MW)', data: dispatchSorted.map(d => Number(d.demand_mw||0)) },
    { name: 'Supply (MW)', data: dispatchSorted.map(d => Number(d.supply_mw||0)) }
  ];
  const dispatchCategories = dispatchSorted.map(d => new Date(d.timestamp).toLocaleString());

  const frequencySeries = [{ name: 'Frequency (Hz)', data: dispatchSorted.map(d => Number(d.frequency_hz||0)) }];
  const frequencyCategories = dispatchCategories;

  // Prepare projects table data
  const projectsTableData = projects.slice(0, 10).map(project => ({
    id: project.project_id,
    location: project.project_location,
    budget: project.budget,
    size: project.project_size_km,
    risk: project.region_risk_flag,
    towerType: project.tower_type,
    substationType: project.substation_type
  }));

  const projectsColumns = [
    {
      key: 'id',
      label: 'Project ID',
      className: 'font-medium text-white'
    },
    {
      key: 'location',
      label: 'Location',
      className: 'text-gray-400'
    },
    {
      key: 'budget',
      label: 'Budget',
      format: (value) => `₹${(value / 1000000).toFixed(1)}M`,
      className: 'text-gray-400'
    },
    {
      key: 'size',
      label: 'Size (km)',
      className: 'text-gray-400'
    },
    {
      key: 'risk',
      label: 'Risk Level',
      format: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'Low' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : value === 'Medium'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">POWERGRID Dashboard</h1>
              <p className="text-gray-400 mt-1">Material demand analytics and project insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Projects"
            value={overview.total_projects}
            change={12}
            changeType="positive"
            icon={Users}
            suffix=" projects"
          />
          <MetricCard
            title="Total Budget"
            value={overview.total_budget / 10000000}
            change={8}
            changeType="positive"
            icon={DollarSign}
            prefix="₹"
            suffix="Cr"
          />
          <MetricCard
            title="Avg Budget"
            value={overview.avg_budget / 1000000}
            change={-3}
            changeType="negative"
            icon={TrendingUp}
            prefix="₹"
            suffix="M"
          />
          <MetricCard
            title="Material Types"
            value={Object.keys(overview.material_totals).length}
            change={0}
            changeType="neutral"
            icon={Package}
            suffix=" types"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Distribution by Location */}
          <InteractiveChart
            type="donut"
            data={[{
              name: 'Projects by Location',
              data: locationData.map(item => item.value)
            }]}
            title="Project Distribution by Location"
            height={350}
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
          />

          {/* Risk Distribution */}
          <InteractiveChart
            type="bar"
            data={[{
              name: 'Risk Distribution',
              data: riskData.map(item => item.value)
            }]}
            title="Risk Distribution"
            height={350}
            colors={['#EF4444', '#F59E0B', '#10B981']}
          />
        </div>

        {/* Material Trends */}
        <InteractiveChart
          type="line"
          data={trendData}
          title="Material Demand Trends (Last 12 Months)"
          height={400}
          colors={['#3B82F6', '#10B981', '#F59E0B']}
        />

        {/* Material Consumption */}
        <InteractiveChart
          type="bar"
          data={materialConsumptionData}
          title="Top Material Consumption"
          height={350}
          colors={['#8B5CF6']}
        />

        {/* Dispatch Demand vs Supply */}
        <InteractiveChart
          type="line"
          data={dispatchSeries}
          title="Demand vs Supply"
          height={350}
          categories={dispatchCategories}
          colors={['#EF4444', '#10B981']}
        />

        {/* Grid Frequency */}
        <InteractiveChart
          type="line"
          data={frequencySeries}
          title="Grid Frequency (Hz)"
          height={300}
          categories={frequencyCategories}
          colors={['#3B82F6']}
        />

        {/* Recent Projects Table */}
        <DataTable
          data={projectsTableData}
          columns={projectsColumns}
          title="Recent Projects"
          searchable={true}
          sortable={true}
        />

        {/* Alerts Section */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Critical Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <div className="p-2 bg-red-900/40 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-300">High Risk Projects</p>
                <p className="text-xs text-red-400">3 projects require attention</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <div className="p-2 bg-yellow-900/40 rounded-lg">
                <Package className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-300">Material Shortage</p>
                <p className="text-xs text-yellow-400">Steel inventory low</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
              <div className="p-2 bg-blue-900/40 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-300">Budget Alert</p>
                <p className="text-xs text-blue-400">2 projects over budget</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onApplyFilters={handleApplyFilters}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default Dashboard;