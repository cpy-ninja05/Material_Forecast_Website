import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Shield, 
  Clock, 
  DollarSign,
  BarChart3,
  PieChart,
  RefreshCw,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import RowRiskCard from './ui/RowRiskCard';

const RowRiskDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [riskZones, setRiskZones] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterRisk, setFilterRisk] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const results = await Promise.allSettled([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/row-risk/analytics`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/row-risk/risk-zones`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/row-risk/projects`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const [analyticsRes, riskZonesRes, projectsRes] = results;

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data.analytics);
      }

      if (riskZonesRes.status === 'fulfilled') {
        setRiskZones(riskZonesRes.value.data);
      }

      if (projectsRes.status === 'fulfilled') {
        setProjects(projectsRes.value.data.projects);
      }

    } catch (error) {
      console.error('Error loading RoW risk data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'Medium': return <Shield className="h-5 w-5 text-yellow-600" />;
      case 'Low': return <Shield className="h-5 w-5 text-green-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filterRisk === 'All') return true;
    return project.row_risk?.risk_level === filterRisk;
  });

  const riskDistributionData = analytics ? [
    { name: 'High Risk', value: analytics.risk_distribution.high, color: '#ef4444' },
    { name: 'Medium Risk', value: analytics.risk_distribution.medium, color: '#f59e0b' },
    { name: 'Low Risk', value: analytics.risk_distribution.low, color: '#10b981' }
  ] : [];

  const stateRiskData = analytics ? Object.entries(analytics.risk_by_state)
    .map(([state, data]) => ({
      state,
      high: data.high || 0,
      medium: data.medium || 0,
      low: data.low || 0,
      total: data.total || 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8) : [];

  const finalStateData = stateRiskData;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RoW Risk Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Right of Way Risk Dashboard</h1>
              <p className="text-gray-600 mt-2">Predict and manage land acquisition challenges for PowerGrid projects</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadData(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.total_projects || 0}</p>
                <p className="text-sm text-gray-600">With RoW assessment</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Projects</p>
                <p className="text-3xl font-bold text-red-600">{analytics?.risk_distribution.high || 0}</p>
                <p className="text-sm text-red-600">Require immediate attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Risk Score</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.average_risk_score || 0}</p>
                <p className="text-sm text-gray-600">Out of 100</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Cost Impact</p>
                <p className="text-3xl font-bold text-red-600">
                  ₹{analytics?.cost_impact_analysis.high_risk_cost ? 
                    (analytics.cost_impact_analysis.high_risk_cost / 100000000).toFixed(1) + 'B' : '0B'}
                </p>
                <p className="text-sm text-red-600">Potential delays</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Risk Distribution Pie Chart */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-gray-900">Risk Distribution</h3>
               <PieChart className="h-5 w-5 text-gray-600" />
             </div>
             
             <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                 <RechartsPieChart>
                   <Pie
                     data={riskDistributionData}
                     cx="50%"
                     cy="50%"
                     innerRadius={50}
                     outerRadius={90}
                     paddingAngle={2}
                     dataKey="value"
                   >
                     {riskDistributionData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{
                       backgroundColor: 'rgba(255,255,255,0.95)',
                       border: '1px solid #e5e7eb',
                       borderRadius: '8px',
                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                       color: '#1f2937'
                     }}
                     formatter={(value, name) => [value, name]}
                     labelStyle={{ color: '#1f2937', fontWeight: '600' }}
                   />
                 </RechartsPieChart>
               </ResponsiveContainer>
             </div>
             
             <div className="mt-6 space-y-2">
               {riskDistributionData.map((item, index) => (
                 <div key={index} className="flex items-center justify-between">
                   <div className="flex items-center">
                     <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                     <span className="text-sm text-gray-600">{item.name}</span>
                   </div>
                   <span className="text-sm font-medium text-gray-900">{item.value}</span>
                 </div>
               ))}
             </div>
           </div>

           {/* Risk by State Bar Chart */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-gray-900">Risk by State</h3>
               <BarChart3 className="h-5 w-5 text-gray-600" />
             </div>
             
             <div className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                   data={finalStateData}
                   margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                 >
                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                   <XAxis 
                     dataKey="state" 
                     stroke="#6b7280"
                     fontSize={12}
                     tickLine={false}
                     axisLine={false}
                     angle={-45}
                     textAnchor="end"
                     height={60}
                   />
                   <YAxis 
                     stroke="#6b7280"
                     fontSize={12}
                     tickLine={false}
                     axisLine={false}
                     domain={[0, 'dataMax + 1']}
                   />
                   <Tooltip 
                     contentStyle={{
                       backgroundColor: 'rgba(255,255,255,0.95)',
                       border: '1px solid #e5e7eb',
                       borderRadius: '8px',
                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                       color: '#1f2937'
                     }}
                     labelStyle={{ color: '#1f2937', fontWeight: '600' }}
                   />
                   <Legend 
                     wrapperStyle={{ 
                       paddingTop: '20px',
                       fontSize: '12px'
                     }}
                   />
                   <Bar dataKey="high" stackId="a" fill="#ef4444" name="High Risk" radius={[0, 0, 4, 4]} />
                   <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium Risk" />
                   <Bar dataKey="low" stackId="a" fill="#10b981" name="Low Risk" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* High Risk Projects Alert */}
        {analytics?.high_risk_projects?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">High Risk Projects Requiring Attention</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.high_risk_projects.slice(0, 6).map((project, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Risk: {project.risk_score}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{project.location}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Budget: ₹{(project.budget / 1000000).toFixed(1)}M</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Risk Assessment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Project Risk Assessment</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
              >
                <option value="All">All Risk Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project._id || project.project_id} className="relative">
                <RowRiskCard
                  riskData={project.row_risk}
                  projectName={project.name}
                  location={project.city && project.state ? `${project.city}, ${project.state}` : project.location}
                  budget={project.cost}
                  status={project.status}
                />
                {selectedProject?.project_id === (project._id || project.project_id) && showDetails && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Detailed Risk Factors</h4>
                    <div className="space-y-2">
                      {Object.entries(project.row_risk?.risk_factors || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
              <p className="text-gray-500">No projects match the selected risk filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RowRiskDashboard;
