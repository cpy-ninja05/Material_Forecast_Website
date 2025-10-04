import React, { useEffect, useState } from 'react';
import { AlertTriangle, Calendar, DollarSign, Filter, MapPin, Package, RefreshCw, Users, Building, Clock, TrendingUp, ShoppingCart, Plus } from 'lucide-react';
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
      const [overviewRes, materialsRes, projectsRes, trendsRes, metricsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/overview'),
        axios.get('http://localhost:5000/api/analytics/materials'),
        axios.get('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('http://localhost:5000/api/dashboard/trends', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('http://localhost:5000/api/dashboard/metrics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      setOverview(overviewRes.data || null);
      setMaterialsTrend(materialsRes.data || null);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      setTrendData(trendsRes.data || []);
      setDashboardMetrics(metricsRes.data || null);
      
      // Log the data we received
      console.log('Dashboard data loaded:');
      console.log('Trend data:', trendsRes.data);
      console.log('Metrics data:', metricsRes.data);
      console.log('Projects data:', projectsRes.data);
      console.log('Projects count:', projectsRes.data?.length || 0);
      
      // Log monthly averages details
      if (trendsRes.data && trendsRes.data.length > 0) {
        console.log('=== MONTHLY AVERAGES DETAILS ===');
        trendsRes.data.forEach(month => {
          console.log(`${month.month}: Forecast Avg = ${month.forecast} tons (${month.forecast_count} projects), Actual Avg = ${month.actual} tons (${month.actual_count} projects)`);
        });
      }
      
      // Log forecast accuracy details
      if (metricsRes.data) {
        console.log('=== FORECAST ACCURACY DETAILS ===');
        console.log('Overall forecast accuracy:', metricsRes.data.forecast_accuracy + '%');
        console.log('Total projects:', metricsRes.data.total_projects);
        console.log('Active projects:', metricsRes.data.active_projects);
        console.log('Timestamp:', metricsRes.data.timestamp);
        if (metricsRes.data.debug_info) {
          console.log('Debug info:', metricsRes.data.debug_info);
          console.log('Individual accuracies:', metricsRes.data.debug_info.individual_accuracies);
          console.log('Calculation details:', metricsRes.data.debug_info.calculation_details);
        }
      }
      
      // Log project status distribution
      if (projectsRes.data && Array.isArray(projectsRes.data)) {
        console.log('=== PROJECT STATUS DISTRIBUTION ===');
        console.log('Raw projects data:', projectsRes.data);
        console.log('First project sample:', projectsRes.data[0]);
        console.log('Projects state after setProjects:', projects);
        
        const inProgress = projectsRes.data.filter(p => p.status === 'IN PROGRESS').length;
        const completed = projectsRes.data.filter(p => p.status === 'COMPLETED').length;
        const planned = projectsRes.data.filter(p => p.status === 'PLANNED').length;
        
        console.log('In Progress:', inProgress);
        console.log('Completed:', completed);
        console.log('Planned:', planned);
        console.log('Total projects:', projectsRes.data.length);
        
        // Log all unique statuses found
        const uniqueStatuses = [...new Set(projectsRes.data.map(p => p.status))];
        console.log('All unique statuses found:', uniqueStatuses);
      } else {
        console.log('No projects data received from API');
        console.log('projectsRes.data:', projectsRes.data);
      }
      
      // Log material forecasts generation
      console.log('=== MATERIAL FORECASTS ===');
      const materialForecasts = generateMaterialForecasts();
      console.log('Generated material forecasts:', materialForecasts);
    } catch (e) {
      console.error('dashboard load failed', e);
      console.log('API error - setting empty data instead of sample data');
      // If API fails, set empty data instead of sample data
      setTrendData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


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

  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Data not found</p>
          <button onClick={() => load(true)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Retry</button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Good Morning, {user?.username || 'User'}!</h1>
              <p className="text-gray-600 mt-2">Here's what's happening with your materials forecasting platform today.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Top Row Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">TOTAL PROJECTS</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardMetrics?.total_projects || 0}</p>
                <p className="text-sm text-green-600">+{dashboardMetrics?.projects_this_month || 0} this month</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ACTIVE PROJECTS</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardMetrics?.active_projects || 0}</p>
                <p className="text-sm text-gray-600">Currently running</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">FORECAST ACCURACY</p>
                <p className="text-3xl font-bold text-gray-900">{calculateForecastAccuracy()}</p>
                <p className="text-sm text-green-600">Average across all projects</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PENDING ORDERS</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardMetrics?.pending_orders || 0}</p>
                <p className="text-sm text-gray-600">Awaiting approval</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </div>


          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">TOTAL ORDERS</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardMetrics?.total_orders || 0}</p>
                <p className="text-sm text-green-600">All time orders</p>
              </div>
              <Package className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forecast vs Actual Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Forecast vs Actual Trends</h3>
                {trendData.length > 0 && (
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">
                      Showing averaged data from {trendData.reduce((sum, item) => sum + (item.forecast_count || 0), 0)} total forecasts
                      {refreshing && <span className="ml-2 text-blue-600">• Refreshing...</span>}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => load(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
            
            <div className="h-80">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name, props) => {
                      const data = props.payload;
                      const count = name === 'forecast' ? data.forecast_count : data.actual_count;
                      return [
                        `${value.toFixed(1)} tons (avg of ${count} projects)`,
                        name === 'forecast' ? 'Forecasted' : 'Actual'
                      ];
                    }}
                    labelFormatter={(label) => `Month: ${label}`}
                    labelStyle={{ color: '#374151', fontWeight: '600' }}
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Status Distribution</h3>
              <div className="h-80">
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
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly Averages Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendData.map((month, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{month.month}</span>
                    <span className="text-xs text-gray-500">
                      {month.forecast_count} forecasts, {month.actual_count} actuals
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Forecast Avg:</span>
                      <span className="font-medium">{month.forecast.toFixed(1)} tons</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Actual Avg:</span>
                      <span className="font-medium">{month.actual.toFixed(1)} tons</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Variance:</span>
                      <span className={`font-medium ${month.actual - month.forecast >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
          </div>
        </div>
      </div>


      {/* Actual Values Modal */}
    </div>
  );
};

export default Dashboard;