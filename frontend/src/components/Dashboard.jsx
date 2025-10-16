import React, { useEffect, useState } from 'react';
import { Calendar, DollarSign, Filter, MapPin, Package, RefreshCw, Users, Building, Clock, TrendingUp, ShoppingCart, Plus } from 'lucide-react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MetricCard from './ui/MetricCard';
import InteractiveChart from './ui/InteractiveChart';
import DataTable from './ui/DataTable';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [materialsTrend, setMaterialsTrend] = useState(null);
  const [materialForecasts, setMaterialForecasts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Dynamic greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 24) return 'Good Evening';
    return 'Good Evening'; // Changed from 'Good Night' to 'Good Evening'
  };

  useEffect(() => { 
    load(); 
    
    // Listen for dashboard refresh events from other components
    const handleDashboardRefresh = () => {
      console.log('Dashboard refresh triggered from external component');
      load(true);
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, []);

  // Helper function to generate material forecasts from actual forecast data
  const generateMaterialForecasts = () => {
    if (!trendData || trendData.length === 0) {
      console.log('No trend data available for material forecasts, returning empty array');
      return [];
    }
    
    // Get the latest month's forecast data
    const latestMonth = trendData[trendData.length - 1];
    if (!latestMonth) {
      console.log('No latest month data available, returning empty array');
      return [];
    }
    
    // Generate material forecasts based on the latest forecast data
    const materialTypes = [
      { name: 'Steel Tower', unit: 'pcs', multiplier: 0.3 },
      { name: 'Conductor Cable', unit: 'km', multiplier: 0.25 },
      { name: 'Insulator', unit: 'pcs', multiplier: 0.2 },
      { name: 'Transformer', unit: 'units', multiplier: 0.15 },
      { name: 'Switchgear', unit: 'units', multiplier: 0.1 }
    ];
    
    const forecasts = materialTypes.map((material, index) => {
      const baseQuantity = latestMonth.forecast * material.multiplier;
      const quantity = Math.round(baseQuantity * 100) / 100;
      const confidence = Math.round(85 + Math.random() * 10); // 85-95% confidence
      
      return {
        material: material.name,
        project: projects.length > 0 ? projects[0].name : 'Current Project',
        quantity: `${quantity} ${material.unit}`,
        confidence: `${confidence}%`
      };
    });
    
    console.log('Generated material forecasts:', forecasts);
    return forecasts.slice(0, 4); // Show top 4
  };

  // Helper function to safely get project counts by status
  const getProjectCounts = () => {
    console.log('getProjectCounts called with projects:', projects);
    console.log('Projects length:', projects?.length);
    
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      console.log('No projects data available, using fallback counts');
      return {
        inProgress: 0,
        completed: 0,
        planned: 0
      };
    }
    
    const inProgress = projects.filter(p => p.status === 'IN PROGRESS').length;
    const completed = projects.filter(p => p.status === 'COMPLETED').length;
    const planned = projects.filter(p => p.status === 'PLANNED').length;
    
    console.log('Project counts:', { inProgress, completed, planned });
    return { inProgress, completed, planned };
  };

  // Fallback helpers for cards when metrics are unavailable
  const getTotalProjects = () => {
    const metricVal = dashboardMetrics?.total_projects;
    if (typeof metricVal === 'number' && metricVal >= 0) return metricVal;
    return Array.isArray(projects) ? projects.length : 0;
  };

  const getActiveProjects = () => {
    const metricVal = dashboardMetrics?.active_projects;
    if (typeof metricVal === 'number' && metricVal >= 0) return metricVal;
    const counts = getProjectCounts();
    return counts.inProgress;
  };

  // Calculate forecast accuracy from backend data
  const calculateForecastAccuracy = () => {
    if (dashboardMetrics && dashboardMetrics.forecast_accuracy !== undefined) {
      console.log('Using backend forecast accuracy:', dashboardMetrics.forecast_accuracy + '%');
      return dashboardMetrics.forecast_accuracy + '%';
    }
    console.log('No backend forecast accuracy available, returning 0%');
    return '0%';
  };

  const load = async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const results = await Promise.allSettled([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/overview`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/materials`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/projects`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/trends`, {
          params: selectedProjectId ? { project_id: selectedProjectId } : {},
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/metrics`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const [overviewRes, materialsRes, projectsRes, trendsRes, metricsRes] = results;

      if (overviewRes.status === 'fulfilled') {
        setOverview(overviewRes.value.data || null);
      } else {
        console.warn('Overview load failed:', overviewRes.reason?.message || overviewRes.reason);
        setOverview(null);
      }

      if (materialsRes.status === 'fulfilled') {
        setMaterialsTrend(materialsRes.value.data || null);
      } else {
        console.warn('Materials trend load failed:', materialsRes.reason?.message || materialsRes.reason);
        setMaterialsTrend(null);
      }

      if (projectsRes.status === 'fulfilled') {
        const pdata = projectsRes.value.data;
        setProjects(Array.isArray(pdata) ? pdata : []);
        if (Array.isArray(pdata)) {
        console.log('=== PROJECT STATUS DISTRIBUTION ===');
          const inProgress = pdata.filter(p => p.status === 'IN PROGRESS').length;
          const completed = pdata.filter(p => p.status === 'COMPLETED').length;
          const planned = pdata.filter(p => p.status === 'PLANNED').length;
        console.log('In Progress:', inProgress);
        console.log('Completed:', completed);
        console.log('Planned:', planned);
          console.log('Total projects:', pdata.length);
          const uniqueStatuses = [...new Set(pdata.map(p => p.status))];
          console.log('All unique statuses found:', uniqueStatuses);
        }
      } else {
        console.warn('Projects load failed:', projectsRes.reason?.message || projectsRes.reason);
        setProjects([]);
      }

      if (trendsRes.status === 'fulfilled') {
        const tdata = trendsRes.value.data || [];
        setTrendData(tdata);
        if (tdata.length > 0) {
          console.log('=== MONTHLY AVERAGES DETAILS ===');
          tdata.forEach(month => {
            console.log(`${month.month}: Forecast Avg = ${month.forecast} tons (${month.forecast_count} projects), Actual Avg = ${month.actual} tons (${month.actual_count} projects)`);
          });
        }
      } else {
        console.warn('Trends load failed:', trendsRes.reason?.message || trendsRes.reason);
        setTrendData([]);
      }

      if (metricsRes.status === 'fulfilled') {
        setDashboardMetrics(metricsRes.value.data || null);
        const m = metricsRes.value.data;
        if (m) {
          console.log('=== FORECAST ACCURACY DETAILS ===');
          console.log('Overall forecast accuracy:', m.forecast_accuracy + '%');
          console.log('Total projects:', m.total_projects);
          console.log('Active projects:', m.active_projects);
          console.log('Timestamp:', m.timestamp);
          if (m.debug_info) {
            console.log('Debug info:', m.debug_info);
            console.log('Individual accuracies:', m.debug_info.individual_accuracies);
            console.log('Calculation details:', m.debug_info.calculation_details);
          }
        }
      } else {
        console.warn('Metrics load failed:', metricsRes.reason?.message || metricsRes.reason);
        setDashboardMetrics(null);
      }
      
      console.log('=== MATERIAL FORECASTS ===');
      const mf = generateMaterialForecasts();
      console.log('Generated material forecasts:', mf);
    } catch (e) {
      console.error('dashboard load failed (unexpected)', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload trends when project filter changes
  useEffect(() => {
    // Only reload trends, keep other datasets
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/trends`, {
          params: selectedProjectId ? { project_id: selectedProjectId } : {},
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setTrendData(res.data || []);
      } catch (e) {
        console.error('failed to load filtered trends', e);
        setTrendData([]);
      }
    })();
  }, [selectedProjectId]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Do not block the entire dashboard when some datasets are missing.
  // Each widget below handles its own empty state gracefully.

  // Sample data for the dashboard matching the image
  const sampleProjects = [
    {
      id: 1,
      name: "Mumbai-Pune Transmission Line",
      location: "Mumbai, Maharashtra",
      status: "IN PROGRESS",
      type: "Transmission Tower",
      cost: "₹5,00,00,000",
      startDate: "15/01/2024"
    },
    {
      id: 2,
      name: "Delhi Grid Substation",
      location: "Delhi, NCR",
      status: "PLANNED",
      type: "Substation",
      cost: "₹3,50,00,000",
      startDate: "20/02/2024"
    },
    {
      id: 3,
      name: "Bangalore Ring Road Transmission",
      location: "Bangalore, Karnataka",
      status: "IN PROGRESS",
      type: "Transmission Tower",
      cost: "₹4,20,00,000",
      startDate: "10/01/2024"
    },
    {
      id: 4,
      name: "Chennai Power Grid",
      location: "Chennai, Tamil Nadu",
      status: "COMPLETED",
      type: "Substation",
      cost: "₹2,80,00,000",
      startDate: "05/12/2023"
    },
    {
      id: 5,
      name: "Kolkata Distribution Network",
      location: "Kolkata, West Bengal",
      status: "IN PROGRESS",
      type: "Transmission Tower",
      cost: "₹3,90,00,000",
      startDate: "25/01/2024"
    }
  ];

  const sampleForecasts = [
    {
      material: "Steel Tower",
      project: "Mumbai-Pune Transmission Line",
      quantity: "277.21 pcs",
      confidence: "90%"
    },
    {
      material: "Conductor Cable",
      project: "Mumbai-Pune Transmission Line",
      quantity: "231.09 km",
      confidence: "83%"
    },
    {
      material: "Insulator",
      project: "Delhi Grid Substation",
      quantity: "156.45 pcs",
      confidence: "87%"
    },
    {
      material: "Power Transformer",
      project: "Bangalore Ring Road Transmission",
      quantity: "89.32 units",
      confidence: "92%"
    }
  ];


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-8 py-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="w-full text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{getGreeting()}, {user?.username || 'User'}!</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Here's what's happening with your materials forecasting platform today.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Top Row Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">TOTAL PROJECTS</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{getTotalProjects()}</p>
                <p className="text-sm text-green-600">+{dashboardMetrics?.projects_this_month ?? 0} this month</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">ACTIVE PROJECTS</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{getActiveProjects()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Currently running</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">FORECAST ACCURACY</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{calculateForecastAccuracy()}</p>
                <p className="text-sm text-green-600">Average across all projects</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">PENDING ORDERS</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboardMetrics?.pending_orders || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting approval</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </div>


          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">TOTAL ORDERS</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboardMetrics?.total_orders || 0}</p>
                <p className="text-sm text-green-600">All time orders</p>
              </div>
              <Package className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forecast vs Actual Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
            <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between mb-4">
              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Actual vs Forecasted Demands</h3>
                {trendData.length > 0 && (
                  <div className="flex items-center mt-1 justify-center md:justify-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      Showing material demand trends over time
                      {refreshing && <span className="ml-2 text-blue-600">• Refreshing...</span>}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3 md:mt-0">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Projects</option>
                  {projects.map(p => (
                    <option key={p.project_id || p.id} value={p.project_id || p.id}>{p.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => load(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Data
                </button>
              </div>
            </div>

            <div className="h-80 overflow-x-auto">
              <div className="min-w-[720px] h-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(31,41,55,0.95)',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name, props) => {
                      return [
                        `${value.toFixed(1)} tons`,
                        name === 'forecast' ? 'Forecasted' : 'Actual'
                      ];
                    }}
                    labelFormatter={(label) => `Month: ${label}`}
                    labelStyle={{ color: '#e5e7eb', fontWeight: '600' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#forecastGradient)"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#actualGradient)"
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Forecast Data</h3>
                    <p className="text-gray-500 mb-4">Generate your first forecast to see trends here</p>
                    <button
                      onClick={() => window.location.href = '/forecasting'}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Forecast
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
            {trendData.length > 0 && (
              <div className="flex items-center justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Forecast</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Actual</span>
                </div>
              </div>
            )}
        </div>

          {/* Project Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Status Distribution</h3>
              <div className="h-80 min-w-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(() => {
                      const counts = getProjectCounts();
                      return [
                        { name: 'In Progress', value: counts.inProgress, color: '#3b82f6' },
                        { name: 'Completed', value: counts.completed, color: '#22c55e' },
                        { name: 'Planned', value: counts.planned, color: '#f59e0b' }
                      ];
                    })()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(() => {
                      const counts = getProjectCounts();
                      return [
                        { name: 'In Progress', value: counts.inProgress, color: '#3b82f6' },
                        { name: 'Completed', value: counts.completed, color: '#22c55e' },
                        { name: 'Planned', value: counts.planned, color: '#f59e0b' }
                      ];
                    })().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{(() => {
                  const counts = getProjectCounts();
                  return counts.inProgress;
                })()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{(() => {
                  const counts = getProjectCounts();
                  return counts.completed;
                })()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Planned</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{(() => {
                  const counts = getProjectCounts();
                  return counts.planned;
                })()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Averages Summary */}
        {trendData.length > 0 && (
          <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Monthly Averages Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendData.map((month, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{month.month}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {month.forecast_count} forecasts, {month.actual_count} actuals
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600 dark:text-blue-400">Forecast Avg:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{month.forecast.toFixed(1)} tons</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Actual Avg:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{month.actual.toFixed(1)} tons</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Variance:</span>
                      <span className={`font-medium ${month.actual - month.forecast >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {(month.actual - month.forecast).toFixed(1)} tons
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Material Forecasts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Material Forecasts</h3>
            {generateMaterialForecasts().length > 0 ? (
              <div className="space-y-4">
                {generateMaterialForecasts().map((forecast, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{forecast.material}</div>
                      <div className="text-sm text-gray-600">{forecast.project}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{forecast.quantity}</div>
                      <div className="text-sm text-green-600">{forecast.confidence}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Material Forecasts</h4>
                <p className="text-gray-500 mb-4">Generate forecasts to see material predictions here</p>
                <button
                  onClick={() => window.location.href = '/forecasting'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Forecast
                </button>
              </div>
            )}
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Projects</h3>
            {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.slice(0, 4).map((project) => (
                <div key={project._id || project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-600">{project.location}</div>
                    <div className="text-sm text-gray-500">{project.tower_type || project.substation_type || 'N/A'}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {project.status}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-1">₹{project.cost ? parseInt(project.cost).toLocaleString() : 'N/A'}</div>
                    <div className="text-xs text-gray-500">{project.startDate}</div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h4>
                <p className="text-gray-500">Projects will appear here once created or fetched.</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Actual Values Modal */}
    </div>
  );
};

export default Dashboard;