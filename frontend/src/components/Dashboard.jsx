import React, { useEffect, useState } from 'react';
import { AlertTriangle, Calendar, DollarSign, Filter, MapPin, Package, RefreshCw, Users, Building, Clock, TrendingUp, ShoppingCart, Plus, X } from 'lucide-react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MetricCard from './ui/MetricCard';
import InteractiveChart from './ui/InteractiveChart';
import DataTable from './ui/DataTable';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [materialsTrend, setMaterialsTrend] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showActualValues, setShowActualValues] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [actualValues, setActualValues] = useState({
    jan: { forecast: 75, actual: 78 },
    feb: { forecast: 82, actual: 85 },
    mar: { forecast: 88, actual: 90 },
    apr: { forecast: 92, actual: 89 },
    may: { forecast: 95, actual: 97 },
    jun: { forecast: 98, actual: 100 }
  });

  useEffect(() => { load(); }, []);

  const load = async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const [overviewRes, materialsRes, projectsRes, trendsRes, metricsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/overview'),
        axios.get('http://localhost:5000/api/analytics/materials'),
        axios.get('http://localhost:5000/api/analytics/projects'),
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
    } catch (e) {
      console.error('dashboard load failed', e);
      // If trends API fails, use sample data
      setTrendData([
        { month: 'Jan', forecast: actualValues.jan.forecast, actual: actualValues.jan.actual },
        { month: 'Feb', forecast: actualValues.feb.forecast, actual: actualValues.feb.actual },
        { month: 'Mar', forecast: actualValues.mar.forecast, actual: actualValues.mar.actual },
        { month: 'Apr', forecast: actualValues.apr.forecast, actual: actualValues.apr.actual },
        { month: 'May', forecast: actualValues.may.forecast, actual: actualValues.may.actual },
        { month: 'Jun', forecast: actualValues.jun.forecast, actual: actualValues.jun.actual }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const handleActualValueChange = (month, field, value) => {
    setActualValues(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [field]: parseInt(value) || 0
      }
    }));
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
              <h1 className="text-3xl font-bold text-gray-900">Good Morning, Admin!</h1>
              <p className="text-gray-600 mt-2">Here's what's happening with your materials forecasting platform today.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowActualValues(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Update Actual Values
              </button>
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
                <p className="text-3xl font-bold text-gray-900">{dashboardMetrics?.forecast_accuracy || 0}%</p>
                <p className="text-sm text-green-600">Based on actual data</p>
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
              <h3 className="text-lg font-semibold text-gray-900">Forecast vs Actual Trends</h3>
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
                    formatter={(value, name) => [
                      `${value.toFixed(1)} tons`,
                      name === 'forecast' ? 'Forecasted' : 'Actual'
                    ]}
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
            </div>
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
        </div>

          {/* Project Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Status Distribution</h3>
              <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'In Progress', value: sampleProjects.filter(p => p.status === 'IN PROGRESS').length, color: '#3b82f6' },
                      { name: 'Completed', value: sampleProjects.filter(p => p.status === 'COMPLETED').length, color: '#22c55e' },
                      { name: 'Planned', value: sampleProjects.filter(p => p.status === 'PLANNED').length, color: '#f59e0b' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {[
                      { name: 'In Progress', value: sampleProjects.filter(p => p.status === 'IN PROGRESS').length, color: '#3b82f6' },
                      { name: 'Completed', value: sampleProjects.filter(p => p.status === 'COMPLETED').length, color: '#22c55e' },
                      { name: 'Planned', value: sampleProjects.filter(p => p.status === 'PLANNED').length, color: '#f59e0b' }
                    ].map((entry, index) => (
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
                <span className="text-sm font-medium text-gray-900">{sampleProjects.filter(p => p.status === 'IN PROGRESS').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{sampleProjects.filter(p => p.status === 'COMPLETED').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Planned</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{sampleProjects.filter(p => p.status === 'PLANNED').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Material Forecasts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Material Forecasts (Next Month)</h3>
            <div className="space-y-4">
              {sampleForecasts.map((forecast, index) => (
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
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Projects</h3>
            <div className="space-y-4">
              {sampleProjects.slice(0, 4).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-600">{project.location}</div>
                    <div className="text-sm text-gray-500">{project.type}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {project.status}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-1">{project.cost}</div>
                    <div className="text-xs text-gray-500">{project.startDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Actual Values Modal */}
      {showActualValues && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Update Actual Values</h2>
              <button 
                onClick={() => setShowActualValues(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(actualValues).map(([month, values]) => (
                <div key={month} className="space-y-3">
                  <h3 className="font-medium text-gray-900 capitalize">{month}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Forecast</label>
                      <input
                        type="number"
                        value={values.forecast}
                        onChange={(e) => handleActualValueChange(month, 'forecast', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Actual</label>
                      <input
                        type="number"
                        value={values.actual}
                        onChange={(e) => handleActualValueChange(month, 'actual', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
        </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setShowActualValues(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowActualValues(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Values
              </button>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;