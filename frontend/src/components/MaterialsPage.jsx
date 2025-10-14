import React, { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, Filter, Download, Eye, 
  BarChart3, PieChart, MapPin, Calendar, AlertTriangle,
  RefreshCw, Search, SortAsc, SortDesc, Target, DollarSign
} from 'lucide-react';
import axios from 'axios';
import InteractiveChart from './ui/InteractiveChart';
import DataTable from './ui/DataTable';
import FilterSidebar from './ui/FilterSidebar';
import MetricCard from './ui/MetricCard';

const MaterialsPage = () => {
  const [materialsData, setMaterialsData] = useState([]);
  const [projectMaterials, setProjectMaterials] = useState([]);
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: 'all',
    towerType: 'all',
    substationType: 'all',
    riskLevel: 'all',
    dateRange: 'all',
    materialType: 'all',
    project: 'all'
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // overview, project-wise, trends

  useEffect(() => {
    fetchMaterialsData();
  }, []);

  const fetchMaterialsData = async () => {
    setLoading(true);
    try {
      const [materialsRes, trendsRes, projectMaterialsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/materials`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/materials`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/project-materials`)
      ]);

      // Process materials data for visualization
      const processedData = Object.entries(materialsRes.data).map(([material, data]) => ({
        name: material,
        key: data.key,
        current: data.values ? data.values[data.values.length - 1] : 0,
        previous: data.values ? data.values[data.values.length - 2] : 0,
        trend: data.values || [],
        unit: material.includes('Tons') ? 'tons' : 'units',
        category: getMaterialCategory(material)
      }));

      setMaterialsData(processedData);
      setTrendsData(trendsRes.data);
      setProjectMaterials(projectMaterialsRes.data);
    } catch (error) {
      console.error('Error fetching materials data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialCategory = (material) => {
    if (material.includes('Steel')) return 'Steel';
    if (material.includes('Concrete') || material.includes('Cement')) return 'Concrete';
    if (material.includes('Aluminum')) return 'Aluminum';
    if (material.includes('Copper')) return 'Copper';
    if (material.includes('Insulator')) return 'Insulators';
    if (material.includes('Cable') || material.includes('Conductor')) return 'Cables';
    if (material.includes('Transformer')) return 'Transformers';
    if (material.includes('Switchgear')) return 'Switchgears';
    if (material.includes('Relay')) return 'Protection';
    if (material.includes('Oil')) return 'Lubricants';
    if (material.includes('Bolt')) return 'Hardware';
    return 'Other';
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // In a real app, you would filter the data based on these filters
    console.log('Applied filters:', newFilters);
  };

  const handleExport = () => {
    // In a real app, you would export the data
    console.log('Exporting materials data...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading materials data...</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const materialConsumptionData = materialsData.map(material => ({
    name: material.name,
    value: material.current
  }));

  const trendData = materialsData.slice(0, 5).map(material => ({
    name: material.name,
    data: material.trend
  }));

  const categoryData = materialsData.reduce((acc, material) => {
    const category = material.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += material.current;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([category, value]) => ({
    name: category,
    value: value
  }));

  // Prepare project-wise data
  const projectWiseData = projectMaterials.map(project => ({
    project_id: project.project_id,
    location: project.project_location,
    budget: project.budget,
    risk: project.region_risk_flag,
    materials: project.materials
  }));

  // Prepare table data
  const tableData = materialsData.map(material => ({
    name: material.name,
    category: material.category,
    current: material.current,
    previous: material.previous,
    change: material.previous > 0 ? ((material.current - material.previous) / material.previous * 100) : 0,
    unit: material.unit,
    trend: material.trend
  }));

  const tableColumns = [
    {
      key: 'name',
      label: 'Material',
      className: 'font-medium text-white'
    },
    {
      key: 'category',
      label: 'Category',
      className: 'text-gray-400'
    },
    {
      key: 'current',
      label: 'Current Demand',
      format: (value, row) => `${value.toFixed(2)} ${row.unit}`,
      className: 'text-gray-400'
    },
    {
      key: 'change',
      label: 'Change',
      format: (value) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
          value > 0 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : value < 0
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Package className="h-8 w-8 mr-3 text-indigo-400" />
                Material Forecast Visualization
              </h1>
              <p className="text-gray-400 mt-1">
                Interactive material demand analysis and forecasting
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'overview'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('project-wise')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'project-wise'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('trends')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'trends'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Materials"
            value={materialsData.length}
            change={5}
            changeType="positive"
            icon={Package}
            suffix=" types"
          />
          <MetricCard
            title="Total Demand"
            value={materialsData.reduce((sum, material) => sum + material.current, 0)}
            change={12}
            changeType="positive"
            icon={TrendingUp}
            suffix=" units"
          />
          <MetricCard
            title="High Demand"
            value={materialsData.filter(m => m.current > 1000).length}
            change={-2}
            changeType="negative"
            icon={AlertTriangle}
            suffix=" materials"
          />
          <MetricCard
            title="Categories"
            value={new Set(materialsData.map(m => m.category)).size}
            change={0}
            changeType="neutral"
            icon={BarChart3}
            suffix=" types"
          />
        </div>

        {/* Main Content based on view mode */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Material Consumption Chart */}
            <InteractiveChart
              type="bar"
              data={[{
                name: 'Material Demand',
                data: materialConsumptionData.map(item => item.value)
              }]}
              title="Current Material Demand"
              height={400}
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
            />

            {/* Category Distribution */}
            <InteractiveChart
              type="donut"
              data={[{
                name: 'Category Distribution',
                data: categoryChartData.map(item => item.value)
              }]}
              title="Material Category Distribution"
              height={400}
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#8B5CF6']}
            />
          </div>
        )}

        {viewMode === 'project-wise' && (
          <div className="space-y-6">
            {/* Project-wise Material Demand */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-indigo-400" />
                Project-wise Material Demand
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectWiseData.slice(0, 6).map((project) => (
                  <div key={project.project_id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{project.project_id}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.risk === 'Low' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : project.risk === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {project.risk}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{project.location} • ₹{(project.budget / 1000000).toFixed(1)}M</p>
                    <div className="space-y-2">
                      {Object.entries(project.materials).slice(0, 3).map(([material, value]) => (
                        <div key={material} className="flex justify-between text-sm">
                          <span className="text-gray-300">{material.split(' ')[0]}</span>
                          <span className="text-white font-medium">{value.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Material Details Table */}
            <DataTable
              data={tableData}
              columns={tableColumns}
              title="Material Demand Analysis"
              searchable={true}
              sortable={true}
            />
          </div>
        )}

        {viewMode === 'trends' && (
          <InteractiveChart
            type="line"
            data={trendData}
            title="Material Demand Trends (Last 12 Months)"
            height={400}
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
          />
        )}

        {/* Forecast Insights */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
            Forecast Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-300">Rising Demand</h4>
              <p className="text-sm text-blue-400 mt-1">
                Steel and concrete demand expected to increase by 15% next month
              </p>
            </div>
            <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <h4 className="font-medium text-yellow-300">Supply Alert</h4>
              <p className="text-sm text-yellow-400 mt-1">
                Aluminum supply chain may face delays in North region
              </p>
            </div>
            <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
              <h4 className="font-medium text-green-300">Cost Optimization</h4>
              <p className="text-sm text-green-400 mt-1">
                Bulk purchasing opportunities available for copper cables
              </p>
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

export default MaterialsPage;