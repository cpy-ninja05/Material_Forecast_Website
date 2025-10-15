import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Building, RefreshCw, TrendingUp } from 'lucide-react';
import axios from 'axios';

const ForecastingPage = () => {
  const [formData, setFormData] = useState({
    project_location: 'North',
    tower_type: 'Tension',
    substation_type: '132 kV AIS',
    region_risk_flag: 'Low',
    budget: 30000000,
    project_size_km: 100,
    tax_rate: 18,
    project_start_month: 1,
    project_end_month: 12,
    lead_time_days: 45,
    commodity_price_index: 105
  });

  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const locationOptions = ['South', 'North', 'East', 'West', 'Central'];
  const towerTypeOptions = ['Suspension', 'Tension', 'Terminal', 'Transposition'];
  const substationTypeOptions = [
    '132 kV AIS', '132 kV GIS', '220 kV AIS', '220 kV GIS', 
    '400 kV AIS', '400 kV GIS', '765 kV AIS', '765 kV GIS', 'HVDC'
  ];
  const riskOptions = ['Low', 'Medium', 'High'];

  // Load projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        console.log('Loading projects...');
        const response = await axios.get('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Projects response:', response.data);
        setProjects(response.data || []);
      } catch (error) {
        console.error('Failed to load projects:', error);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };
    loadProjects();
    
    // Check if redirected from ProjectManagement with a selected project
    const selectedProjectData = localStorage.getItem('selectedProjectForForecast');
    if (selectedProjectData) {
      try {
        const project = JSON.parse(selectedProjectData);
        setSelectedProject(project);
        // Clear the stored data after using it
        localStorage.removeItem('selectedProjectForForecast');
      } catch (error) {
        console.error('Failed to parse selected project data:', error);
        localStorage.removeItem('selectedProjectForForecast');
      }
    }
  }, []);

  // Update form data when project is selected
  useEffect(() => {
    if (selectedProject) {
      setFormData(prev => ({
        ...prev,
        project_location: selectedProject.location || 'North',
        budget: selectedProject.cost || 30000000,
        tower_type: selectedProject.tower_type || 'Suspension',
        substation_type: selectedProject.substation_type || '132 kV AIS',
        project_size_km: selectedProject.project_size_km || 0,
        // Add more project-specific fields to make forecasts unique
        project_start_month: selectedProject.start_date ? new Date(selectedProject.start_date).getMonth() + 1 : 1,
        project_end_month: selectedProject.end_date ? new Date(selectedProject.end_date).getMonth() + 1 : 12,
        // Add project-specific variations to ensure unique forecasts
        lead_time_days: 30 + (selectedProject.project_id ? parseInt(selectedProject.project_id.slice(-2)) % 30 : 0),
        commodity_price_index: 100 + (selectedProject.project_id ? parseInt(selectedProject.project_id.slice(-2)) % 20 : 0),
        // Keep forecasting-specific fields as they were
      }));
    }
  }, [selectedProject]);
  
  // Target materials from the model
  const targetMaterials = [
    'quantity_steel_tons',
    'quantity_copper_tons', 
    'quantity_cement_tons',
    'quantity_aluminum_tons',
    'quantity_insulators_count',
    'quantity_conductors_tons',
    'quantity_transformers_count',
    'quantity_switchgears_count',
    'quantity_cables_count',
    'quantity_protective_relays_count',
    'quantity_oil_tons',
    'quantity_foundation_concrete_tons',
    'quantity_bolts_count'
  ];

  // Sample forecast data matching the image
  const sampleForecasts = [
    {
      material: "Steel Tower",
      project: "Mumbai-Pune Transmission Line",
      quantity: 366.21,
      unit: "pcs",
      range: "292.97 - 439.45",
      confidence: 93.0,
      period: "November 2025",
      status: "high"
    },
    {
      material: "Conductor Cable",
      project: "Mumbai-Pune Transmission Line",
      quantity: 239.59,
      unit: "km",
      range: "191.67 - 287.51",
      confidence: 90.0,
      period: "November 2025",
      status: "high"
    },
    {
      material: "Insulator",
      project: "Mumbai-Pune Transmission Line",
      quantity: 474.56,
      unit: "pcs",
      range: "379.65 - 569.48",
      confidence: 76.0,
      period: "November 2025",
      status: "low"
    },
    {
      material: "Steel Tower",
      project: "Delhi Grid Substation",
      quantity: 312.5,
      unit: "pcs",
      range: "250 - 375",
      confidence: 77.0,
      period: "November 2025",
      status: "low"
    },
    {
      material: "Conductor Cable",
      project: "Delhi Grid Substation",
      quantity: 461.89,
      unit: "km",
      range: "369.51 - 554.26",
      confidence: 94.0,
      period: "November 2025",
      status: "high"
    },
    {
      material: "Insulator",
      project: "Delhi Grid Substation",
      quantity: 407.18,
      unit: "pcs",
      range: "325.74 - 488.62",
      confidence: 84.0,
      period: "November 2025",
      status: "medium"
    },
    {
      material: "Steel Tower",
      project: "Bangalore Ring Road Transmission",
      quantity: 53.49,
      unit: "pcs",
      range: "42.79 - 64.19",
      confidence: 80.0,
      period: "November 2025",
      status: "medium"
    },
    {
      material: "Conductor Cable",
      project: "Bangalore Ring Road Transmission",
      quantity: 132.45,
      unit: "km",
      range: "105.96 - 158.94",
      confidence: 78.0,
      period: "November 2025",
      status: "low"
    }
  ];

  const refreshProjects = async () => {
    setProjectsLoading(true);
    try {
      console.log('Refreshing projects...');
      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Refreshed projects:', response.data);
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to refresh projects:', error);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPredictions(null);

    try {
      // Get current month and year for forecast storage
      const currentDate = new Date();
      const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
      
      console.log('=== FORECAST GENERATION DEBUG ===');
      console.log('Current date:', currentDate);
      console.log('Current month:', currentMonth);
      console.log('Selected project:', selectedProject?.project_id);
      
      // Prepare forecast data with project info and current month
      const forecastData = {
        ...formData,
        project_id: selectedProject ? selectedProject.project_id : 'unknown',
        forecast_month: currentMonth // Save forecast for current month
      };
      
      console.log('Sending forecast data:', forecastData);
      console.log('Selected project:', selectedProject);
      console.log('Forecast month:', currentMonth);
      
      const response = await axios.post('http://localhost:5000/api/forecast', forecastData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
            setPredictions(response.data.predictions);
            console.log('Forecast saved successfully for month:', currentMonth);
            
            // Trigger dashboard refresh
            window.dispatchEvent(new CustomEvent('dashboardRefresh'));
            console.log('Triggered dashboard refresh after generating new forecast');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.includes('already exists')) {
        setError(`Forecast already exists for ${currentMonth}. You can update it by generating a new forecast.`);
      } else {
        setError(err.response?.data?.error || 'Forecasting failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'project_size_km' ? Number(value) : value
    }));
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status) => {
    if (status === 'high') return '✓';
    if (status === 'medium') return '!';
    return '⚠';
  };

  const getStatusColor = (status) => {
    if (status === 'high') return 'text-green-600';
    if (status === 'medium') return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-8">
          <div className="flex flex-col items-start">
            <h1 className="text-3xl font-bold text-gray-900">Material Demand Forecasting</h1>
            <p className="text-gray-600 mt-2">AI-powered predictions for next month's material requirements</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Project Parameters Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Project Parameters
          </h2>
          
          {/* Project Selection */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Select Project</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose Project
                </label>
                <select
                  value={selectedProject ? selectedProject.project_id : ''}
                  onChange={(e) => {
                    const project = projects.find(p => p.project_id === e.target.value);
                    setSelectedProject(project || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={projectsLoading}
                >
                  <option value="">{projectsLoading ? 'Loading projects...' : projects.length === 0 ? 'No projects available' : 'Select a project'}</option>
                  {projects.map(project => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.name} - {project.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:ml-4">
                <button
                  type="button"
                  onClick={refreshProjects}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm whitespace-nowrap"
                  disabled={projectsLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${projectsLoading ? 'animate-spin' : ''}`} />
                  Refresh Projects
                </button>
              </div>
            </div>
            {selectedProject && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Project Details</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Project Name</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                      <span>{selectedProject.name}</span>
                      <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Location</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                      <span>{selectedProject.location}</span>
                      <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Tower Type</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                      <span>{selectedProject.tower_type || 'Not set'}</span>
                      <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Substation Type</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                      <span>{selectedProject.substation_type || 'Not set'}</span>
                      <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Project Size</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                      <span>{parseFloat(selectedProject.project_size_km || 0)} km</span>
                      <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Budget</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                      <span>₹{(selectedProject.cost / 1000000).toFixed(1)}M</span>
                      <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Start Date</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                      <span>{selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString('en-GB') : 'Not set'}</span>
                      <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">End Date</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                      <span>{selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString('en-GB') : 'Not set'}</span>
                      <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <div className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    Fields marked with checkmark are automatically populated from project data
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Forecasting Parameters */}
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-yellow-600" />
              <h3 className="text-sm font-medium text-yellow-900">Additional Forecasting Parameters Required</h3>
            </div>
            <p className="text-xs text-yellow-700">
              Please provide the following technical specifications for accurate material forecasting:
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region Risk Flag *
              </label>
              <select
                name="region_risk_flag"
                value={formData.region_risk_flag}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Risk Level</option>
                {riskOptions.map(risk => (
                  <option key={risk} value={risk}>{risk}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                name="tax_rate"
                value={formData.tax_rate}
                onChange={handleChange}
                min="0"
                max="30"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tax rate percentage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Start Month *
              </label>
              <select
                name="project_start_month"
                value={formData.project_start_month}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Start Month</option>
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project End Month *
              </label>
              <select
                name="project_end_month"
                value={formData.project_end_month}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select End Month</option>
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Time (Days)
              </label>
              <input
                type="number"
                name="lead_time_days"
                value={formData.lead_time_days}
                onChange={handleChange}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Lead time in days"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commodity Price Index
              </label>
              <input
                type="number"
                name="commodity_price_index"
                value={formData.commodity_price_index}
                onChange={handleChange}
                min="50"
                max="200"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Commodity price index"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Forecasting...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Forecast
                </>
              )}
            </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

      {predictions && (
        <div className="mt-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900">Forecast Generated Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">Forecast data has been saved to the database and can be viewed in the Projects section.</p>
              </div>
            </div>
          </div>

          {/* Forecast Results Display */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Forecast Results</h3>
              <div className="text-sm text-gray-500">
                Generated for: October 2025
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(predictions).map(([material, quantity]) => (
                <div key={material} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm text-blue-900">
                      {material.replace('quantity_', '').replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {quantity.toFixed(2)}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    {material.includes('tons') ? 'Tons' : 
                     material.includes('count') ? 'Units' : 'Units'}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {Object.keys(predictions).length}
                </div>
                <div className="text-sm text-gray-600">Materials Forecasted</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {Object.values(predictions).reduce((sum, qty) => sum + qty, 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Total Quantity</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedProject ? selectedProject.name : 'Current Project'}
                </div>
                <div className="text-sm text-gray-600">Project Name</div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>

      </div>
    </div>
  );
};

export default ForecastingPage;
