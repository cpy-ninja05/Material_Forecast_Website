import React, { useState, useEffect } from 'react';
import { Building, MapPin, Calendar, DollarSign, TrendingUp, Plus, Edit, Eye, BarChart3, Grid3X3, AlertCircle, CheckCircle, Clock, Save, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// Edit Project Form Component
const EditProjectForm = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: project.name || '',
    location: project.location || '',
    status: project.status || 'PLANNED',
    tower_type: project.tower_type || 'Suspension',
    substation_type: project.substation_type || '132 kV AIS',
    cost: project.cost || 0,
    start_date: project.start_date || '',
    end_date: project.end_date || '',
    project_size_km: project.project_size_km || 0,
    description: project.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...project, ...formData });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PLANNED">Planned</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tower Type *
          </label>
          <select
            name="tower_type"
            value={formData.tower_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="Suspension">Suspension</option>
            <option value="Tension">Tension</option>
            <option value="Terminal">Terminal</option>
            <option value="Transposition">Transposition</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Substation Type *
          </label>
          <select
            name="substation_type"
            value={formData.substation_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="132 kV AIS">132 kV AIS</option>
            <option value="132 kV GIS">132 kV GIS</option>
            <option value="220 kV AIS">220 kV AIS</option>
            <option value="220 kV GIS">220 kV GIS</option>
            <option value="400 kV AIS">400 kV AIS</option>
            <option value="400 kV GIS">400 kV GIS</option>
            <option value="765 kV AIS">765 kV AIS</option>
            <option value="765 kV GIS">765 kV GIS</option>
            <option value="HVDC">HVDC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (₹)
          </label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="1000000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Size (km) *
          </label>
          <input
            type="number"
            name="project_size_km"
            value={formData.project_size_km}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.1"
            placeholder="Enter project size in kilometers"
            required
          />
        </div>

      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter project description..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </form>
  );
};

// Create Project Form Component
const CreateProjectForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'PLANNED',
    tower_type: 'Suspension',
    substation_type: '132 kV AIS',
    cost: 0,
    start_date: '',
    end_date: '',
    project_size_km: 0,
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter project name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter project location"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tower Type *
          </label>
          <select
            name="tower_type"
            value={formData.tower_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="Suspension">Suspension</option>
            <option value="Tension">Tension</option>
            <option value="Terminal">Terminal</option>
            <option value="Transposition">Transposition</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Substation Type *
          </label>
          <select
            name="substation_type"
            value={formData.substation_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="132 kV AIS">132 kV AIS</option>
            <option value="132 kV GIS">132 kV GIS</option>
            <option value="220 kV AIS">220 kV AIS</option>
            <option value="220 kV GIS">220 kV GIS</option>
            <option value="400 kV AIS">400 kV AIS</option>
            <option value="400 kV GIS">400 kV GIS</option>
            <option value="765 kV AIS">765 kV AIS</option>
            <option value="765 kV GIS">765 kV GIS</option>
            <option value="HVDC">HVDC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PLANNED">Planned</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (₹) *
          </label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter budget in rupees"
            min="0"
            step="1000000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Size (km) *
          </label>
          <input
            type="number"
            name="project_size_km"
            value={formData.project_size_km}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.1"
            placeholder="Enter project size in kilometers"
            required
          />
        </div>

      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter project description..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>
    </form>
  );
};

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showActualValuesModal, setShowActualValuesModal] = useState(false);
  const [actualValues, setActualValues] = useState({});
  const [forecastData, setForecastData] = useState(null);
  const [materialActualValues, setMaterialActualValues] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthData, setMonthData] = useState({});
  const [loadingActuals, setLoadingActuals] = useState(false);
  const [historicalForecasts, setHistoricalForecasts] = useState({});
  const [historicalActuals, setHistoricalActuals] = useState({});
  const [selectedForecastMonth, setSelectedForecastMonth] = useState('');
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const [projectForecasts, setProjectForecasts] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentProjectMonthInfo, setCurrentProjectMonthInfo] = useState(null);
  const [error, setError] = useState('');

  // Get current, previous, and next month + past 4 months (dynamic based on project start date)
  const getMonthInfo = (projectStartDate = null) => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format
    
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = prevMonth.toISOString().slice(0, 7);
    
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthStr = nextMonth.toISOString().slice(0, 7);
    
    // Calculate the earliest month we can show
    let earliestMonth = new Date(now.getFullYear(), now.getMonth() - 4, 1);
    if (projectStartDate) {
      const projectStart = new Date(projectStartDate);
      // If project hasn't started yet, show months from project start to current month
      if (projectStart > now) {
        // Project is in the future - show current month only
        earliestMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        // Project has started - use the later of project start date or 4 months ago
        // Convert project start to month start for comparison
        const projectStartMonth = new Date(projectStart.getFullYear(), projectStart.getMonth(), 1);
        earliestMonth = projectStartMonth > earliestMonth ? projectStartMonth : earliestMonth;
      }
    }
    
    // Generate months from current month back to earliest possible month (max 5 months)
    const pastMonths = [];
    let currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
    
    console.log('Month generation debug:');
    console.log('Current date:', currentDate);
    console.log('Earliest month:', earliestMonth);
    console.log('Current date >= earliestMonth:', currentDate >= earliestMonth);
    
    for (let i = 0; i < 5 && currentDate >= earliestMonth; i++) {
      const monthValue = currentDate.toISOString().slice(0, 7);
      const monthDisplay = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      pastMonths.push({ value: monthValue, display: monthDisplay });
      console.log(`Added month ${i + 1}:`, monthValue, monthDisplay);
      
      // Move to previous month
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    }
    
    console.log('Final pastMonths:', pastMonths);
    
    return {
      current: currentMonth,
      previous: prevMonthStr,
      next: nextMonthStr,
      currentDisplay: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      previousDisplay: prevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      nextDisplay: nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      pastMonths: pastMonths
    };
  };

  const monthInfo = getMonthInfo();

  // Target materials from the model
  const targetMaterials = [
    { key: 'quantity_steel_tons', name: 'Steel (Tons)', unit: 'tons' },
    { key: 'quantity_copper_tons', name: 'Copper (Tons)', unit: 'tons' },
    { key: 'quantity_cement_tons', name: 'Cement (Tons)', unit: 'tons' },
    { key: 'quantity_aluminum_tons', name: 'Aluminum (Tons)', unit: 'tons' },
    { key: 'quantity_insulators_count', name: 'Insulators', unit: 'units' },
    { key: 'quantity_conductors_tons', name: 'Conductors (Tons)', unit: 'tons' },
    { key: 'quantity_transformers_count', name: 'Transformers', unit: 'units' },
    { key: 'quantity_switchgears_count', name: 'Switchgears', unit: 'units' },
    { key: 'quantity_cables_count', name: 'Cables', unit: 'units' },
    { key: 'quantity_protective_relays_count', name: 'Protective Relays', unit: 'units' },
    { key: 'quantity_oil_tons', name: 'Oil (Tons)', unit: 'tons' },
    { key: 'quantity_foundation_concrete_tons', name: 'Foundation Concrete (Tons)', unit: 'tons' },
    { key: 'quantity_bolts_count', name: 'Bolts', unit: 'units' }
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjectForecasts = async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}/forecasts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProjectForecasts(prev => ({
        ...prev,
        [projectId]: response.data || []
      }));
    } catch (error) {
      console.error('Failed to load project forecasts:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data);
      
      // Load forecasts for each project
      response.data.forEach(project => {
        loadProjectForecasts(project.project_id);
      });
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Use sample data if API fails
      setProjects([
        {
          project_id: 'P0001',
          name: 'Mumbai-Pune Transmission Line',
          location: 'Mumbai, Maharashtra',
          status: 'IN PROGRESS',
          type: 'Transmission Tower',
          cost: 50000000,
          start_date: '2024-01-15',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          project_id: 'P0002',
          name: 'Delhi Grid Substation',
          location: 'Delhi, NCR',
          status: 'PLANNED',
          type: 'Substation',
          cost: 35000000,
          start_date: '2024-02-20',
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          project_id: 'P0003',
          name: 'Bangalore Ring Road Transmission',
          location: 'Bangalore, Karnataka',
          status: 'IN PROGRESS',
          type: 'Transmission Tower',
          cost: 42000000,
          start_date: '2024-01-10',
          created_at: '2024-01-10T00:00:00Z'
        },
        {
          project_id: 'P0004',
          name: 'Chennai Power Grid',
          location: 'Chennai, Tamil Nadu',
          status: 'COMPLETED',
          type: 'Substation',
          cost: 28000000,
          start_date: '2023-12-05',
          created_at: '2023-12-01T00:00:00Z'
        },
        {
          project_id: 'P0005',
          name: 'Kolkata Distribution Network',
          location: 'Kolkata, West Bengal',
          status: 'IN PROGRESS',
          type: 'Transmission Tower',
          cost: 39000000,
          start_date: '2024-01-25',
          created_at: '2024-01-20T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const redirectToForecasting = () => {
    // Store the selected project in localStorage so ForecastingPage can pre-select it
    if (selectedProject) {
      localStorage.setItem('selectedProjectForForecast', JSON.stringify(selectedProject));
    }
    // Navigate to forecasting page
    window.location.href = '/forecasting';
  };

  const generateForecast = async (project) => {
    console.log('Generating forecast for project:', project);
    setSelectedProject(project);
    
    // Check if project has started
    const today = new Date();
    const projectStartDate = new Date(project.start_date);
    const hasProjectStarted = projectStartDate <= today;
    console.log('Project start date:', project.start_date);
    console.log('Today:', today.toISOString().slice(0, 10));
    console.log('Has project started:', hasProjectStarted);
    
    // Get month info based on project start date
    const projectMonthInfo = getMonthInfo(project.start_date);
    console.log('Project month info:', projectMonthInfo);
    setCurrentProjectMonthInfo(projectMonthInfo);
    
    // Check if there are any available months
    if (!projectMonthInfo.pastMonths || projectMonthInfo.pastMonths.length === 0) {
      console.log('No months available');
      if (!hasProjectStarted) {
        setForecastError('Project has not started yet. You can still generate forecasts for future planning.');
        setShowForecastModal(true);
        return;
      } else {
        setForecastError('No months available for this project.');
        setShowForecastModal(true);
        return;
      }
    }
    
    // Start with current month (first month in pastMonths array)
    const currentMonth = projectMonthInfo.current;
    console.log('Setting selected forecast month to current month:', currentMonth);
    setSelectedForecastMonth(currentMonth);
    setForecastLoading(true);
    setForecastError('');
    
    try {
      // Load existing forecast data from database
      const forecastsResponse = await axios.get(`http://localhost:5000/api/projects/${project.project_id}/forecasts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Forecasts response:', forecastsResponse.data);
      
      if (forecastsResponse.data && forecastsResponse.data.length > 0) {
        // Find forecast for the current month
        const currentMonthForecast = forecastsResponse.data.find(f => f.forecast_month === currentMonth);
        if (currentMonthForecast) {
          console.log('Found forecast for current month:', currentMonthForecast);
          setForecastData(currentMonthForecast.predictions);
          setShowForecastModal(true);
        } else {
          console.log('No forecast found for current month, using latest forecast');
          const latestForecast = forecastsResponse.data[0];
          console.log('Latest forecast:', latestForecast);
          setForecastData(latestForecast.predictions);
          setShowForecastModal(true);
        }
      } else {
        // No forecast data available
        console.log('No forecast data available');
        setForecastError('No forecast data available for this project. Click "Generate Forecast" to create one.');
        setShowForecastModal(true);
      }
    } catch (error) {
      console.error('Failed to load forecast data:', error);
      setForecastError('Failed to load forecast data. Please try again.');
      setShowForecastModal(true);
    } finally {
      setForecastLoading(false);
    }
  };

  const openActualValuesModal = async (project) => {
    console.log('Opening actual values modal for project:', project);
    setSelectedProject(project);
    
    // Get month info based on project start date
    const projectMonthInfo = getMonthInfo(project.start_date);
    console.log('Project month info:', projectMonthInfo);
    setCurrentProjectMonthInfo(projectMonthInfo);
    
    // Check if there are any available months
    if (!projectMonthInfo.pastMonths || projectMonthInfo.pastMonths.length === 0) {
      console.log('No months available, setting error');
      setError('No months available for this project. Project may not have started yet.');
      setShowActualValuesModal(true);
      return;
    }
    
    // Start with current month
    const currentMonth = projectMonthInfo.current;
    console.log('Setting selected month to current month:', currentMonth);
    setSelectedMonth(currentMonth);
    
      // Load existing data for current month and historical data
      try {
        await Promise.all([
          loadMaterialActuals(project.project_id, currentMonth),
          loadHistoricalData(project.project_id),
          loadProjectForecasts(project.project_id)
        ]);
      console.log('Data loaded, showing modal');
      setShowActualValuesModal(true);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
      setShowActualValuesModal(true);
    }
  };

  const calculateMaterialMetrics = (materialValues, forecastData) => {
    // Calculate total actual quantity
    const totalActual = Object.values(materialValues).reduce((sum, value) => {
      return sum + (parseFloat(value) || 0);
    }, 0);

    // Calculate total forecast quantity
    const totalForecast = forecastData ? Object.values(forecastData).reduce((sum, value) => {
      return sum + (parseFloat(value) || 0);
    }, 0) : 0;

    // Calculate accuracy percentage
    const accuracyPercentage = totalForecast > 0 ? 
      Math.round(((totalActual / totalForecast) * 100) * 10) / 10 : 0;

    // Calculate variance (actual - forecast)
    const variance = totalActual - totalForecast;
    const variancePercentage = totalForecast > 0 ? 
      Math.round((variance / totalForecast) * 100 * 10) / 10 : 0;

    return {
      totalActual,
      totalForecast,
      accuracyPercentage,
      variance,
      variancePercentage,
      status: accuracyPercentage >= 95 ? 'Excellent' : 
              accuracyPercentage >= 90 ? 'Good' : 
              accuracyPercentage >= 80 ? 'Fair' : 'Poor'
    };
  };

  const loadMaterialActuals = async (projectId, month) => {
    setLoadingActuals(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/material-actuals?project_id=${projectId}&month=${month}`);
      if (response.data && response.data.length > 0) {
        const actualData = response.data[0];
        setMaterialActualValues(actualData.material_values || {});
        setMonthData(actualData);
      } else {
        setMaterialActualValues({});
        setMonthData({});
      }
    } catch (error) {
      console.error('Failed to load material actuals:', error);
      setMaterialActualValues({});
      setMonthData({});
    } finally {
      setLoadingActuals(false);
    }
  };

  const saveMaterialActuals = async (projectId, month, materialValues) => {
    setLoadingActuals(true);
    try {
      // Get forecast data for the current month
      const projectForecastsData = projectForecasts[projectId] || [];
      const currentMonthForecast = projectForecastsData.find(f => f.forecast_month === month);
      
      // Calculate metrics with proper forecast data
      const metrics = calculateMaterialMetrics(materialValues, currentMonthForecast?.predictions || {});
      
      const payload = {
        project_id: projectId,
        month: month,
        material_values: materialValues,
        combined_score: metrics.totalActual,
        forecast_total: metrics.totalForecast,
        accuracy_percentage: metrics.accuracyPercentage,
        created_at: new Date().toISOString(),
        created_by: localStorage.getItem('username') || 'unknown'
      };

      console.log('Saving material actuals with payload:', payload);

      const response = await axios.post('http://localhost:5000/api/material-actuals', payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Material actuals saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to save material actuals:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    } finally {
      setLoadingActuals(false);
    }
  };

  const handleMaterialValueChange = (materialKey, value) => {
    setMaterialActualValues(prev => ({
      ...prev,
      [materialKey]: value
    }));
  };

  const handleMonthChange = async (month) => {
    setSelectedMonth(month);
    if (selectedProject) {
      await loadMaterialActuals(selectedProject.project_id, month);
    }
  };

  const handleForecastMonthChange = async (month) => {
    setSelectedForecastMonth(month);
    if (selectedProject) {
      setForecastLoading(true);
      setForecastError('');
      setForecastData(null);

      try {
        // Load existing forecast data for the selected month
        const forecastsResponse = await axios.get(`http://localhost:5000/api/projects/${selectedProject.project_id}/forecasts`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (forecastsResponse.data && forecastsResponse.data.length > 0) {
          // Find forecast for the selected month
          const monthForecast = forecastsResponse.data.find(forecast => forecast.forecast_month === month);
          
          if (monthForecast) {
            setForecastData(monthForecast.predictions);
          } else {
            setForecastError(`No forecast data available for ${month}. Please generate a forecast from the Forecasting page first.`);
          }
        } else {
          setForecastError('No forecast data available for this project. Please generate a forecast from the Forecasting page first.');
        }
      } catch (err) {
        setForecastError('Failed to load forecast data for this month');
        console.error('Forecast error:', err);
      } finally {
        setForecastLoading(false);
      }
    }
  };

  const loadHistoricalData = async (projectId) => {
    try {
      // Load historical forecasts and actuals for available months
      const allMonths = (currentProjectMonthInfo?.pastMonths || monthInfo.pastMonths).map(m => m.value);

      const forecastPromises = allMonths.map(month => 
        axios.get(`http://localhost:5000/api/forecasts?project_id=${projectId}&month=${month}`)
      );
      
      const actualPromises = allMonths.map(month => 
        axios.get(`http://localhost:5000/api/material-actuals?project_id=${projectId}&month=${month}`)
      );

      const [forecastResults, actualResults] = await Promise.all([
        Promise.all(forecastPromises),
        Promise.all(actualPromises)
      ]);

      // Process forecast data - only show real data, no sample data
      const forecasts = {};
      forecastResults.forEach((response, index) => {
        const month = allMonths[index];
        if (response.data && response.data.length > 0) {
          forecasts[month] = response.data;
        }
        // Don't generate sample data - only show real data
      });

      // Process actual data - only show real data, no sample data
      const actuals = {};
      actualResults.forEach((response, index) => {
        const month = allMonths[index];
        if (response.data && response.data.length > 0) {
          actuals[month] = response.data[0];
        }
        // Don't generate sample data - only show real data
      });

      setHistoricalForecasts(forecasts);
      setHistoricalActuals(actuals);
    } catch (error) {
      console.error('Failed to load historical data:', error);
      // Don't generate sample data - only show real data
      setHistoricalForecasts({});
      setHistoricalActuals({});
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  const openDeleteModal = (project) => {
    setDeletingProject(project);
    setShowDeleteModal(true);
  };

  const handleEditProject = async (updatedProject) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/projects/${updatedProject.project_id}`, updatedProject);
      
      // Update the local projects state
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.project_id === updatedProject.project_id ? { ...p, ...updatedProject } : p
        )
      );
      
        setShowEditModal(false);
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`);
      
      // Remove the project from local state
      setProjects(prevProjects => 
        prevProjects.filter(p => p.project_id !== projectId)
      );
      
      setShowDeleteModal(false);
      alert('Project deleted successfully!');
      } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleCreateProject = async (newProject) => {
    try {
      const response = await axios.post('http://localhost:5000/api/projects', newProject);
      
      // Add the new project to local state
      setProjects(prevProjects => [...prevProjects, response.data]);
      
      setShowCreateModal(false);
      alert('Project created successfully!');
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PLANNED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'IN PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PLANNED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600 mt-2">Manage projects, view forecasts, and track actual values</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </button>
            </div>
              </div>
            </div>
          </div>
          
      <div className="p-8 space-y-8">
        {/* View Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Projects Overview</h3>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 flex items-center gap-2 text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Grid View
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-4 py-2 flex items-center gap-2 text-sm ${
                  viewMode === 'chart' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Chart View
              </button>
              </div>
            </div>
          </div>
          
        {/* Projects Grid/Chart */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.project_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {project.location}
                </p>
              </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} flex items-center gap-1`}>
                    {getStatusIcon(project.status)}
                    {project.status}
            </div>
          </div>
          
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tower Type</span>
                    <span className="text-sm font-semibold text-gray-900">{project.tower_type || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Substation Type</span>
                    <span className="text-sm font-semibold text-gray-900">{project.substation_type || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Project Size</span>
                    <span className="text-sm font-semibold text-gray-900">{project.project_size_km || 0} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Budget</span>
                    <span className="text-sm font-semibold text-gray-900">₹{(project.cost / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start Date</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  {projectForecasts[project.project_id] && projectForecasts[project.project_id].length > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium mb-1">Latest Forecast</div>
                      <div className="text-xs text-gray-600">
                        {projectForecasts[project.project_id][0].forecast_month} - 
                        Steel: {projectForecasts[project.project_id][0].predictions?.quantity_steel_tons?.toFixed(1)} tons
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => generateForecast(project)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3" />
                    Forecast
                  </button>
                  <button
                    onClick={() => openActualValuesModal(project)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Actual Values
                  </button>
            </div>
            
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => openEditModal(project)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit Project
                  </button>
                  <button
                    onClick={() => openDeleteModal(project)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    Delete
              </button>
            </div>
          </div>
            ))}
        </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Budget Distribution</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projects.map(project => ({
                  name: project.name.split(' ')[0],
                  budget: project.cost / 1000000, // Convert to millions
                  status: project.status
                }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
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
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: '600' }}
                    formatter={(value, name) => [`₹${value}M`, 'Budget']}
                  />
                  <Bar 
                    dataKey="budget" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
          </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">Project Budget Distribution</span>
                    </div>
                  </div>
        )}
                </div>

      {/* Forecast Modal */}
      {showForecastModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Forecast for {selectedProject.name}
              </h2>
              <p className="text-sm text-gray-500">View and manage forecast data for this project</p>
            </div>
            <button
              onClick={() => setShowForecastModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

            {/* Past 4 Months + Current Month Selection for Forecast */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Current & Past 4 Months</h3>
              {(currentProjectMonthInfo?.pastMonths && currentProjectMonthInfo.pastMonths.length > 0) ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(currentProjectMonthInfo?.pastMonths || monthInfo.pastMonths).map((month) => (
                    <button
                      key={month.value}
                      onClick={() => handleForecastMonthChange(month.value)}
                      className={`p-4 rounded-lg border text-center transition-all duration-200 ${
                        selectedForecastMonth === month.value 
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                          : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-sm mb-2">{month.display}</div>
                      <div className="text-xs text-gray-500 mb-1">
                        {projectForecasts[selectedProject?.project_id]?.some(f => f.forecast_month === month.value) ? 'Forecast ✓' : 'No Forecast'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {historicalActuals[month.value] ? 'Actual ✓' : 'No Actual'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg">
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">No months available for this project</span>
                  </div>
                </div>
              )}
            </div>

            {forecastLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                <p className="text-blue-600">Loading forecast data...</p>
              </div>
            ) : forecastError ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 px-8 py-6 rounded-xl mb-6">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-4 flex-shrink-0 mt-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 text-lg mb-2">No Forecast Available</h4>
                    <p className="text-sm text-blue-700 mb-4 leading-relaxed">{forecastError}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={redirectToForecasting}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors duration-200 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Generate Forecast
                      </button>
                      <button
                        onClick={() => setShowForecastModal(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : forecastData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(forecastData).map(([material, quantity]) => (
                  <div key={material} className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-sm text-gray-700 mb-1">
                      {material.replace('quantity_', '').replace('_', ' ').toUpperCase()}
                        </div>
                    <div className="text-2xl font-bold text-gray-900">{quantity.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {material.includes('tons') ? 'Tons' : 
                       material.includes('count') ? 'Units' : 'Units'}
                          </div>
                        </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 text-slate-600 px-8 py-12 rounded-xl text-center">
                <div className="text-slate-400 mb-6">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800 text-xl mb-3">No Forecast Data</h4>
                <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                  No prediction available for {selectedForecastMonth || 'this month'}. 
                  Generate a forecast to see material requirements and planning insights.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={redirectToForecasting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors duration-200 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Generate Forecast
                  </button>
                  <button
                    onClick={() => setShowForecastModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Actual Values Modal */}
      {showActualValuesModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Material Actual Values - {selectedProject.name}
              </h2>
                  <button
                onClick={() => setShowActualValuesModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                ✕
                  </button>
                </div>
                
            {/* Past 4 Months + Current Month Selection */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Current & Past 4 Months</h3>
              {(currentProjectMonthInfo?.pastMonths && currentProjectMonthInfo.pastMonths.length > 0) ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(currentProjectMonthInfo?.pastMonths || monthInfo.pastMonths).map((month) => (
                    <button
                      key={month.value}
                      onClick={() => handleMonthChange(month.value)}
                      className={`p-3 rounded-lg border text-left ${
                        selectedMonth === month.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{month.display}</div>
                      <div className="text-xs text-gray-500">
                        {projectForecasts[selectedProject?.project_id]?.some(f => f.forecast_month === month.value) ? 'Forecast ✓' : 'No Forecast'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {historicalActuals[month.value] ? 'Actual ✓' : 'No Actual'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium">No months available for this project</span>
                  </div>
                </div>
              )}
            </div>
                    
            {/* Material Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {targetMaterials.map((material) => (
                <div key={material.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {material.name}
                  </label>
                  <div className="flex items-center">
                      <input
                        type="number"
                      value={materialActualValues[material.key] || ''}
                      onChange={(e) => handleMaterialValueChange(material.key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      step="0.01"
                      disabled={loadingActuals}
                      />
                    <span className="ml-2 text-sm text-gray-500">{material.unit}</span>
                    </div>
                  </div>
              ))}
                    </div>
                    
            {/* Historical Comparison */}
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Forecast vs Actual Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(historicalActuals).map(month => {
                  const actual = historicalActuals[month];
                  const forecast = historicalForecasts[month];
                  const monthDisplay = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  
                  if (!actual || !forecast) return null;
                  
                  const accuracy = actual.accuracy_percentage || 0;
                  const variance = actual.combined_score - actual.forecast_total;
                  
                  return (
                    <div key={month} className="bg-white p-4 rounded-lg border">
                      <div className="font-medium text-gray-900 mb-2">{monthDisplay}</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Forecast:</span>
                          <span className="font-semibold text-blue-600">{actual.forecast_total?.toFixed(1) || 'N/A'}</span>
                    </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Actual:</span>
                          <span className="font-semibold text-green-600">{actual.combined_score?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accuracy:</span>
                          <span className={`font-semibold ${
                            accuracy >= 95 ? 'text-green-600' :
                            accuracy >= 90 ? 'text-blue-600' :
                            accuracy >= 80 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {accuracy.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Variance:</span>
                          <span className={`font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variance >= 0 ? '+' : ''}{variance.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {Object.keys(historicalActuals).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-lg mb-2">No Historical Data Available</div>
                  <div className="text-sm">Enter actual values for past months to see trends</div>
                </div>
              )}
                  </div>
                  
            {/* Current Month Analysis */}
            {(() => {
              // Get forecast data for the selected month
              const projectForecastsData = projectForecasts[selectedProject?.project_id] || [];
              const currentMonthForecast = projectForecastsData.find(f => f.forecast_month === selectedMonth);
              const forecastData = currentMonthForecast?.predictions || {};
              
              const metrics = calculateMaterialMetrics(materialActualValues, forecastData);
              return (
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Month Analysis ({selectedMonth})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Total Actual</div>
                      <div className="text-2xl font-bold text-green-600">{metrics.totalActual.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">units</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Total Forecast</div>
                      <div className="text-2xl font-bold text-blue-600">{metrics.totalForecast.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">units</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Accuracy</div>
                      <div className={`text-2xl font-bold ${
                        metrics.accuracyPercentage >= 95 ? 'text-green-600' :
                        metrics.accuracyPercentage >= 90 ? 'text-blue-600' :
                        metrics.accuracyPercentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {metrics.accuracyPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">{metrics.status}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Variance</div>
                      <div className={`text-2xl font-bold ${
                        metrics.variance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metrics.variance >= 0 ? '+' : ''}{metrics.variance.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {metrics.variancePercentage >= 0 ? '+' : ''}{metrics.variancePercentage}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Material Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Entered Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {targetMaterials.map((material) => {
                  const value = materialActualValues[material.key];
                  if (value && !isNaN(parseFloat(value)) && parseFloat(value) > 0) {
                    return (
                      <div key={material.key} className="bg-white p-3 rounded border">
                        <div className="font-medium text-sm text-gray-700">{material.name}</div>
                        <div className="text-lg font-bold text-gray-900">{parseFloat(value).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{material.unit}</div>
                      </div>
                    );
                  }
                  return null;
                })}
                    </div>
                  </div>
                  
            <div className="flex gap-3">
                    <button
                onClick={() => setShowActualValuesModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                onClick={async () => {
                  try {
                    await saveMaterialActuals(selectedProject.project_id, selectedMonth, materialActualValues);
                    alert('Material values saved successfully!');
                    setShowActualValuesModal(false);
                  } catch (error) {
                    console.error('Save error:', error);
                    const errorMessage = error.response?.data?.error || error.message || 'Failed to save material values. Please try again.';
                    alert(`Error: ${errorMessage}`);
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loadingActuals}
              >
                {loadingActuals ? 'Saving...' : 'Save Material Values'}
                    </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Project: {editingProject.name}
              </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                ✕
                  </button>
                </div>
                
            <EditProjectForm 
              project={editingProject}
              onSave={handleEditProject}
              onCancel={() => setShowEditModal(false)}
                      />
                    </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Project
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
                  </div>
                  
            <CreateProjectForm 
              onSave={handleCreateProject}
              onCancel={() => setShowCreateModal(false)}
                    />
                  </div>
                    </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && deletingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Delete Project
              </h2>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
                  </div>
                  
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                    <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Are you sure you want to delete this project?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This action cannot be undone.
                  </p>
                    </div>
                  </div>
                  
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{deletingProject.name}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Project ID: {deletingProject.project_id}</div>
                  <div>Location: {deletingProject.location}</div>
                  <div>Status: {deletingProject.status}</div>
                  <div>Budget: ₹{(deletingProject.cost / 1000000).toFixed(1)}M</div>
                    </div>
                    </div>
                  </div>
                  
            <div className="flex gap-3">
                    <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                onClick={() => handleDeleteProject(deletingProject.project_id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                Delete Project
                    </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ProjectManagement;
